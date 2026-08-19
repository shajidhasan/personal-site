import { describe, expect, it } from 'vitest';
import { checkStringFields, isTrue, resourceUrl } from './api-auth';

describe('resourceUrl', () => {
	it('builds a note URL', () => {
		expect(resourceUrl('https://sh4jid.me', 'n', 'abc')).toBe('https://sh4jid.me/n/abc');
	});

	it('does not double the slash when the origin has a trailing one', () => {
		expect(resourceUrl('https://sh4jid.me/', 'l', 'xy')).toBe('https://sh4jid.me/l/xy');
	});
});

describe('checkStringFields', () => {
	it('accepts a body whose fields are all strings', () => {
		expect(checkStringFields({ title: 'T', alias: 'a' }, ['title', 'alias'])).toBeNull();
	});

	it('ignores fields that are absent', () => {
		expect(checkStringFields({ title: 'T' }, ['title', 'alias'])).toBeNull();
	});

	it('treats an explicit null as absent, since validators default it anyway', () => {
		expect(checkStringFields({ message: null }, ['message'])).toBeNull();
	});

	it('rejects a number where a string is expected, which would throw on .trim()', () => {
		expect(checkStringFields({ title: 123 }, ['title'])).toBe('"title" must be a string.');
	});

	it('rejects an object', () => {
		expect(checkStringFields({ alias: { a: 1 } }, ['alias'])).toBe('"alias" must be a string.');
	});

	it('rejects an array', () => {
		expect(checkStringFields({ title: ['a'] }, ['title'])).toBe('"title" must be a string.');
	});

	it('ignores fields outside the checked list', () => {
		expect(checkStringFields({ extra: 99 }, ['title'])).toBeNull();
	});
});

describe('isTrue', () => {
	it('accepts only JSON true', () => {
		expect(isTrue(true)).toBe(true);
	});

	it('rejects the string "true", which is not a JSON boolean', () => {
		expect(isTrue('true')).toBe(false);
	});

	it('rejects the string "false", which would otherwise be truthy and overwrite', () => {
		expect(isTrue('false')).toBe(false);
	});

	it('rejects undefined and 1', () => {
		expect(isTrue(undefined)).toBe(false);
		expect(isTrue(1)).toBe(false);
	});
});
