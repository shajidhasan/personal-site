import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearConfig, configPath, readConfig, writeConfig } from './config';

let home: string;

beforeEach(() => {
	home = mkdtempSync(join(tmpdir(), 'sh4-'));
	process.env.XDG_CONFIG_HOME = home;
});

afterEach(() => {
	delete process.env.XDG_CONFIG_HOME;
	rmSync(home, { recursive: true, force: true });
});

describe('config', () => {
	it('returns null when no config file exists', () => {
		expect(readConfig()).toBeNull();
	});

	it('round-trips a written config', () => {
		writeConfig({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
		expect(readConfig()).toEqual({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
	});

	it('writes the file readable only by the owner', () => {
		writeConfig({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
		expect(statSync(configPath()).mode & 0o777).toBe(0o600);
	});

	it('returns null rather than throwing on a malformed file', () => {
		mkdirSync(join(home, 'sh4'), { recursive: true });
		writeFileSync(configPath(), 'not json');
		expect(readConfig()).toBeNull();
	});

	it('returns null when the file parses but has no key', () => {
		mkdirSync(join(home, 'sh4'), { recursive: true });
		writeFileSync(configPath(), JSON.stringify({ baseUrl: 'https://sh4jid.me' }));
		expect(readConfig()).toBeNull();
	});

	it('falls back to the default base URL when the file omits it', () => {
		mkdirSync(join(home, 'sh4'), { recursive: true });
		writeFileSync(configPath(), JSON.stringify({ apiKey: 'secret' }));
		expect(readConfig()?.baseUrl).toBe('https://sh4jid.me');
	});

	it('clearConfig removes the stored credential', () => {
		writeConfig({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
		clearConfig();
		expect(readConfig()).toBeNull();
	});

	it('clearConfig is a no-op when nothing is stored', () => {
		expect(() => clearConfig()).not.toThrow();
	});
});

describe('config file permissions', () => {
	it('tightens an existing world-readable config, which writeFileSync alone would not', () => {
		mkdirSync(join(home, 'sh4'), { recursive: true });
		writeFileSync(configPath(), '{}', { mode: 0o644 });
		expect(statSync(configPath()).mode & 0o777).toBe(0o644);

		writeConfig({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
		expect(statSync(configPath()).mode & 0o777).toBe(0o600);
	});

	it('creates the containing directory owner-only', () => {
		writeConfig({ baseUrl: 'https://sh4jid.me', apiKey: 'secret' });
		expect(statSync(join(home, 'sh4')).mode & 0o777).toBe(0o700);
	});
});
