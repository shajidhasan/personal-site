import { readConfig, type Config } from './config';

export class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class NotLoggedInError extends Error {
	constructor() {
		super("Not logged in. Run 'sh4 login' first.");
		this.name = 'NotLoggedInError';
	}
}

export const requireConfig = (): Config => {
	const config = readConfig();
	if (!config) throw new NotLoggedInError();
	return config;
};

export const apiRequest = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
	const config = requireConfig();

	const response = await fetch(new URL(path, config.baseUrl), {
		method,
		headers: {
			'x-api-key': config.apiKey,
			...(body === undefined ? {} : { 'content-type': 'application/json' })
		},
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	if (response.status === 204) return undefined as T;

	const payload = (await response.json().catch(() => ({}))) as { message?: string };

	if (!response.ok) {
		throw new ApiError(response.status, payload.message ?? `Request failed (${response.status}).`);
	}

	return payload as T;
};
