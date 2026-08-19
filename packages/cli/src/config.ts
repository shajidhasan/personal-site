import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const DEFAULT_BASE_URL = 'https://sh4jid.me';

export type Config = {
	baseUrl: string;
	apiKey: string;
};

export const configPath = (): string => {
	const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
	return join(base, 'sh4', 'config.json');
};

export const readConfig = (): Config | null => {
	const path = configPath();
	if (!existsSync(path)) return null;

	try {
		const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<Config>;
		if (typeof parsed.apiKey !== 'string' || !parsed.apiKey) return null;
		return { baseUrl: parsed.baseUrl || DEFAULT_BASE_URL, apiKey: parsed.apiKey };
	} catch {
		// A corrupt config should send you to `sh4 login`, not crash the CLI.
		return null;
	}
};

export const writeConfig = (config: Config): void => {
	const path = configPath();
	mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
	writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
	// writeFileSync's mode only applies when it creates the file, so an existing config that
	// was somehow world-readable would stay that way. This holds an API key — enforce it.
	chmodSync(path, 0o600);
};

export const clearConfig = (): void => {
	rmSync(configPath(), { force: true });
};
