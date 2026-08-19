import { describe, expect, it } from 'vitest';
import { resourceUrl } from './api-auth';

describe('resourceUrl', () => {
	it('builds a note URL', () => {
		expect(resourceUrl('https://sh4jid.me', 'n', 'abc')).toBe('https://sh4jid.me/n/abc');
	});

	it('does not double the slash when the origin has a trailing one', () => {
		expect(resourceUrl('https://sh4jid.me/', 'l', 'xy')).toBe('https://sh4jid.me/l/xy');
	});
});
