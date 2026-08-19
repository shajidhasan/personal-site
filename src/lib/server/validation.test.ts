import { describe, expect, it } from 'vitest';
import { formString } from './validation';

describe('formString', () => {
	it('returns the trimmed-as-is string value for a present field', () => {
		const fd = new FormData();
		fd.set('title', 'Hello');
		expect(formString(fd, 'title')).toBe('Hello');
	});

	it('returns an empty string for a missing field', () => {
		expect(formString(new FormData(), 'title')).toBe('');
	});

	it('returns an empty string when the field is a File rather than text', () => {
		const fd = new FormData();
		fd.set('title', new File(['x'], 'x.txt'));
		expect(formString(fd, 'title')).toBe('');
	});
});
