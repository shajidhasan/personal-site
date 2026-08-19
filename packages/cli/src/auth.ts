import { hostname } from 'node:os';
import * as p from '@clack/prompts';
import { clearConfig, DEFAULT_BASE_URL, readConfig, writeConfig } from './config';
import { fail } from './output';

const CLIENT_ID = 'sh4-cli';

type DeviceCodeResponse = {
	device_code: string;
	user_code: string;
	verification_uri: string;
	verification_uri_complete?: string;
	expires_in: number;
	interval: number;
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const postJson = async (baseUrl: string, path: string, body: unknown, token?: string) => {
	const response = await fetch(new URL(path, baseUrl), {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			// better-auth rejects POSTs whose Origin doesn't match its baseURL, and Node's fetch
			// sets no Origin at all — without this every auth call 404s against a real domain.
			// Safe here: the CLI holds no ambient cookies, so there is no CSRF surface to protect.
			origin: baseUrl,
			...(token ? { authorization: `Bearer ${token}` } : {})
		},
		body: JSON.stringify(body)
	});
	return {
		ok: response.ok,
		status: response.status,
		data: await response.json().catch(() => ({}))
	};
};

export const login = async (opts: { baseUrl?: string }): Promise<void> => {
	const baseUrl = opts.baseUrl?.replace(/\/$/, '') || DEFAULT_BASE_URL;

	p.intro('sh4 login');

	const start = await postJson(baseUrl, '/api/auth/device/code', { client_id: CLIENT_ID }).catch(
		() => null
	);
	if (!start?.ok) fail(`Could not reach ${baseUrl}. Is the site up, and is --base-url correct?`);

	const device = start!.data as DeviceCodeResponse;
	const verifyUrl = device.verification_uri_complete ?? device.verification_uri;

	p.note(`${verifyUrl}\n\nCode: ${device.user_code}`, 'Approve this device in your browser');

	const spinner = p.spinner();
	spinner.start('Waiting for approval');

	const deadline = Date.now() + device.expires_in * 1000;
	let interval = device.interval || 5;
	let accessToken: string | null = null;

	while (Date.now() < deadline) {
		await sleep(interval);

		const poll = await postJson(baseUrl, '/api/auth/device/token', {
			grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
			device_code: device.device_code,
			client_id: CLIENT_ID
		});

		const data = poll.data as { access_token?: string; error?: string };

		if (data.access_token) {
			accessToken = data.access_token;
			break;
		}
		if (data.error === 'authorization_pending') continue;
		if (data.error === 'slow_down') {
			interval += 5;
			continue;
		}

		spinner.stop('Not approved');
		if (data.error === 'access_denied') fail('Request denied in the browser.');
		if (data.error === 'expired_token') fail('The code expired. Run `sh4 login` again.');
		fail(`Login failed: ${data.error ?? 'unknown error'}.`);
	}

	if (!accessToken) {
		spinner.stop('Timed out');
		fail('The code expired before it was approved. Run `sh4 login` again.');
	}

	// Trade the short-lived session for a durable, per-machine, revocable API key.
	const created = await postJson(
		baseUrl,
		'/api/auth/api-key/create',
		{ name: `sh4-cli@${hostname()}` },
		accessToken!
	);

	if (!created.ok) {
		spinner.stop('Failed');
		fail('Approved, but creating the API key failed. Check the server logs.');
	}

	const { key } = created.data as { key?: string };
	if (!key) {
		spinner.stop('Failed');
		fail('Approved, but the server returned no API key.');
	}

	writeConfig({ baseUrl, apiKey: key! });
	spinner.stop('Logged in');
	p.outro(`Saved credentials for ${baseUrl}.`);
};

export const logout = (): void => {
	const config = readConfig();
	clearConfig();

	if (!config) {
		p.log.info('Nothing stored — already logged out.');
		return;
	}

	p.log.success(
		'Logged out. Revoke the key itself from /admin if you no longer trust this machine.'
	);
};

export const whoami = async (): Promise<void> => {
	const config = readConfig();
	if (!config) fail("Not logged in. Run 'sh4 login' first.");

	const response = await fetch(new URL('/api/v1/notes', config!.baseUrl), {
		headers: { 'x-api-key': config!.apiKey }
	}).catch(() => null);

	if (!response) fail(`Could not reach ${config!.baseUrl}.`);

	if (response!.status === 401) {
		clearConfig();
		fail("Access revoked. Run 'sh4 login'.");
	}

	// Anything else non-2xx means the check did not actually pass — reporting "logged in" off
	// the back of a 500 or a 429 would be a lie about the one thing this command exists to say.
	if (!response!.ok) {
		fail(`${config!.baseUrl} answered ${response!.status}; could not confirm the credential.`);
	}

	p.log.success(`Logged in to ${config!.baseUrl} (key ending ...${config!.apiKey.slice(-6)}).`);
};
