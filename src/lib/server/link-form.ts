import { generateRandomString } from '$lib/utilities';
import { formString, type Validated } from './validation';
import { ALIAS_ERROR, ALIAS_PATTERN } from './note-form';

export type LinkInput = {
	destinationUrl?: string;
	alias?: string;
	message?: string | null;
};

export type LinkValues = {
	destinationUrl: string;
	alias: string;
	message: string | null;
};

const isHttpUrl = (value: string): boolean => {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
};

// requireAlias is for the edit form, where the field is prefilled: an empty alias there means
// the user cleared it, and silently generating a new one would break the existing /l/ URL.
export const validateLink = (
	input: LinkInput,
	opts: { requireAlias?: boolean } = {}
): Validated<LinkValues> => {
	const destinationUrl = (input.destinationUrl ?? '').trim();
	const alias = (input.alias ?? '').trim();
	const message = (input.message ?? '').trim();

	if (!destinationUrl) return { error: 'Destination URL is required.' };
	// The CLI accepts arbitrary input, so reject anything that isn't a real http(s) URL.
	if (!isHttpUrl(destinationUrl)) return { error: 'Destination must be a valid http(s) URL.' };
	if (opts.requireAlias && !alias) return { error: 'Alias is required.' };
	if (alias && !ALIAS_PATTERN.test(alias)) return { error: ALIAS_ERROR };

	return {
		values: {
			destinationUrl,
			alias: alias || generateRandomString(4),
			message: message || null
		}
	};
};

export const parseLinkForm = (formData: FormData): LinkInput => ({
	destinationUrl: formString(formData, 'destinationUrl'),
	alias: formString(formData, 'alias'),
	message: formString(formData, 'message')
});
