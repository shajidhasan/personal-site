import { describe, expect, it } from 'vitest';
import { validatePaste } from './paste-form';

describe('validatePaste', () => {
	it('rejects a missing title', () => {
		expect(validatePaste({ content: 'x', contentHtml: '<pre>x</pre>' }).error).toBe(
			'Title is required.'
		);
	});

	it('rejects whitespace-only content', () => {
		expect(validatePaste({ title: 'T', content: '   ', contentHtml: '<pre></pre>' }).error).toBe(
			'Content is required.'
		);
	});

	it('defaults the language to plaintext', () => {
		const { values } = validatePaste({ title: 'T', content: 'x', contentHtml: '<pre>x</pre>' });
		expect(values!.language).toBe('plaintext');
	});

	it('generates a 6-character alias when none is given', () => {
		const { values } = validatePaste({ title: 'T', content: 'x', contentHtml: '<pre>x</pre>' });
		expect(values!.alias).toMatch(/^[A-Za-z0-9]{6}$/);
	});

	it('requires an alias when asked, so editing cannot silently re-alias a live paste', () => {
		expect(
			validatePaste(
				{ title: 'T', alias: '', content: 'x', contentHtml: '<pre>x</pre>' },
				{ requireAlias: true }
			).error
		).toBe('Alias is required.');
	});
});
