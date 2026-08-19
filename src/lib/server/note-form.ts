import { generateRandomString } from '$lib/utilities';
import { formString, type Validated } from './validation';

// Aliases become URL path segments (/n/<alias>), so restrict them to path-safe characters.
export const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;
export const ALIAS_ERROR = 'Alias may only contain letters, numbers, hyphens, and underscores.';

export type NoteInput = {
	title?: string;
	alias?: string;
	content?: string;
	contentHtml?: string;
};

export type NoteValues = {
	title: string;
	alias: string;
	content: string;
	contentHtml: string;
};

// requireAlias is for the edit form, where the field is prefilled: an empty alias there means
// the user cleared it, and silently generating a new one would break the existing /n/ URL.
export const validateNote = (
	input: NoteInput,
	opts: { requireAlias?: boolean } = {}
): Validated<NoteValues> => {
	const title = (input.title ?? '').trim();
	const alias = (input.alias ?? '').trim();
	const content = input.content ?? '';
	const contentHtml = input.contentHtml ?? '';

	if (!title) return { error: 'Title is required.' };
	if (opts.requireAlias && !alias) return { error: 'Alias is required.' };
	if (alias && !ALIAS_PATTERN.test(alias)) return { error: ALIAS_ERROR };
	// contentHtml is rendered by the caller (admin browser or CLI); the server never renders.
	if (!contentHtml) return { error: 'Rendered content is missing.' };

	return {
		values: {
			title,
			alias: alias || generateRandomString(8).toLowerCase(),
			content,
			contentHtml
		}
	};
};

export const parseNoteForm = (formData: FormData): NoteInput => ({
	title: formString(formData, 'title'),
	alias: formString(formData, 'alias'),
	content: formString(formData, 'content'),
	contentHtml: formString(formData, 'contentHtml')
});
