import { describe, expect, it } from 'vitest';
import { validateNote, parseNoteForm } from './note-form';

describe('validateNote', () => {
	it('rejects a missing title', () => {
		expect(validateNote({ title: '  ', content: 'x', contentHtml: '<p>x</p>' }).error).toBe(
			'Title is required.'
		);
	});

	it('rejects missing rendered HTML so a note can never render as raw markdown', () => {
		expect(validateNote({ title: 'T', content: 'x', contentHtml: '' }).error).toBe(
			'Rendered content is missing.'
		);
	});

	it('generates an 8-character lowercase alias when none is given', () => {
		const { values } = validateNote({ title: 'T', content: 'x', contentHtml: '<p>x</p>' });
		expect(values!.alias).toMatch(/^[a-z0-9]{8}$/);
	});

	it('keeps an explicitly supplied alias', () => {
		const { values } = validateNote({
			title: 'T',
			alias: 'my-note',
			content: 'x',
			contentHtml: '<p>x</p>'
		});
		expect(values!.alias).toBe('my-note');
	});

	it('rejects an alias containing characters that are unsafe in a URL path', () => {
		expect(
			validateNote({ title: 'T', alias: 'bad alias!', content: 'x', contentHtml: '<p>x</p>' }).error
		).toBe('Alias may only contain letters, numbers, hyphens, and underscores.');
	});

	it('requires an alias when asked, so editing cannot silently re-alias a live note', () => {
		expect(
			validateNote(
				{ title: 'T', alias: '', content: 'x', contentHtml: '<p>x</p>' },
				{ requireAlias: true }
			).error
		).toBe('Alias is required.');
	});

	it('still generates an alias on create, where the field is genuinely optional', () => {
		const { values } = validateNote({ title: 'T', content: 'x', contentHtml: '<p>x</p>' }, {});
		expect(values!.alias).toMatch(/^[a-z0-9]{8}$/);
	});

	it('trims the title', () => {
		const { values } = validateNote({ title: '  T  ', content: 'x', contentHtml: '<p>x</p>' });
		expect(values!.title).toBe('T');
	});
});

describe('parseNoteForm', () => {
	it('reads the four note fields off FormData', () => {
		const fd = new FormData();
		fd.set('title', 'T');
		fd.set('alias', 'a');
		fd.set('content', '# T');
		fd.set('contentHtml', '<h1>T</h1>');
		expect(parseNoteForm(fd)).toEqual({
			title: 'T',
			alias: 'a',
			content: '# T',
			contentHtml: '<h1>T</h1>'
		});
	});
});
