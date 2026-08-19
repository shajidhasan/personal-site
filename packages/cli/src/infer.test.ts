import { describe, expect, it } from 'vitest';
import { inferLanguage, inferTitle } from './infer';

describe('inferTitle', () => {
	it('prefers an explicit title above everything else', () => {
		expect(inferTitle({ explicit: 'Chosen', markdown: '# Heading', filePath: 'f.md' })).toBe(
			'Chosen'
		);
	});

	it('falls back to the first H1 in the markdown', () => {
		expect(inferTitle({ markdown: 'intro\n\n# Real Heading\n\nbody', filePath: 'f.md' })).toBe(
			'Real Heading'
		);
	});

	it('ignores deeper headings when choosing a title', () => {
		expect(inferTitle({ markdown: '## Not This\n\n# But This' })).toBe('But This');
	});

	it('does not treat a # inside a fenced code block as a heading', () => {
		expect(inferTitle({ markdown: '```sh\n# not a heading\n```\n', filePath: 'notes.md' })).toBe(
			'notes'
		);
	});

	it('falls back to the filename without its extension', () => {
		expect(inferTitle({ markdown: 'no heading', filePath: '/tmp/My Notes.md' })).toBe('My Notes');
	});

	it('falls back to Untitled for stdin with no heading', () => {
		expect(inferTitle({ markdown: 'no heading' })).toBe('Untitled');
	});

	it('ignores a blank explicit title', () => {
		expect(inferTitle({ explicit: '   ', markdown: '# Heading' })).toBe('Heading');
	});
});

describe('inferLanguage', () => {
	it('prefers an explicit language', () => {
		expect(inferLanguage({ explicit: 'rust', filePath: 'a.ts' })).toBe('rust');
	});

	it('maps a known extension', () => {
		expect(inferLanguage({ filePath: '/x/main.ts' })).toBe('typescript');
	});

	it('maps an extension that differs from its language name', () => {
		expect(inferLanguage({ filePath: 'script.py' })).toBe('python');
	});

	it('falls back to plaintext for an unknown extension', () => {
		expect(inferLanguage({ filePath: 'data.xyz' })).toBe('plaintext');
	});

	it('falls back to plaintext for stdin', () => {
		expect(inferLanguage({})).toBe('plaintext');
	});

	it('falls back to plaintext for a file with no extension', () => {
		expect(inferLanguage({ filePath: '/etc/hosts' })).toBe('plaintext');
	});

	it('is case-insensitive about the extension', () => {
		expect(inferLanguage({ filePath: 'Main.TS' })).toBe('typescript');
	});
});
