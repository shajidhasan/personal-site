import { describe, expect, it } from 'vitest';
import { validateLink } from './link-form';

describe('validateLink', () => {
	it('rejects a missing destination', () => {
		expect(validateLink({}).error).toBe('Destination URL is required.');
	});

	it('rejects a destination that is not a valid URL', () => {
		expect(validateLink({ destinationUrl: 'not a url' }).error).toBe(
			'Destination must be a valid http(s) URL.'
		);
	});

	it('rejects non-http schemes so a short link cannot smuggle javascript:', () => {
		expect(validateLink({ destinationUrl: 'javascript:alert(1)' }).error).toBe(
			'Destination must be a valid http(s) URL.'
		);
	});

	it('accepts an https URL and generates a 4-character alias', () => {
		const { values } = validateLink({ destinationUrl: 'https://example.com/a' });
		expect(values!.destinationUrl).toBe('https://example.com/a');
		expect(values!.alias).toMatch(/^[A-Za-z0-9]{4}$/);
	});

	it('requires an alias when asked, so editing cannot silently re-alias a live link', () => {
		expect(
			validateLink({ destinationUrl: 'https://example.com', alias: '' }, { requireAlias: true })
				.error
		).toBe('Alias is required.');
	});

	it('normalises an empty message to null', () => {
		const { values } = validateLink({ destinationUrl: 'https://example.com', message: '  ' });
		expect(values!.message).toBeNull();
	});
});
