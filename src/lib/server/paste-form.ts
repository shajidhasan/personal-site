import { generateRandomString } from '$lib/utilities';
import { formString, type Validated } from './validation';
import { ALIAS_ERROR, ALIAS_PATTERN } from './note-form';

export type PasteInput = {
	title?: string;
	alias?: string;
	language?: string;
	content?: string;
	contentHtml?: string;
};

export type PasteValues = {
	title: string;
	alias: string;
	language: string;
	content: string;
	contentHtml: string;
};

// requireAlias is for the edit form, where the field is prefilled: an empty alias there means
// the user cleared it, and silently generating a new one would break the existing /p/ URL.
export const validatePaste = (
	input: PasteInput,
	opts: { requireAlias?: boolean } = {}
): Validated<PasteValues> => {
	const title = (input.title ?? '').trim();
	const alias = (input.alias ?? '').trim();
	const content = input.content ?? '';
	const contentHtml = input.contentHtml ?? '';

	if (!title) return { error: 'Title is required.' };
	if (opts.requireAlias && !alias) return { error: 'Alias is required.' };
	if (!content.trim()) return { error: 'Content is required.' };
	if (alias && !ALIAS_PATTERN.test(alias)) return { error: ALIAS_ERROR };
	if (!contentHtml) return { error: 'Rendered content is missing.' };

	return {
		values: {
			title,
			alias: alias || generateRandomString(6),
			language: (input.language ?? '').trim() || 'plaintext',
			content,
			contentHtml
		}
	};
};

export const parsePasteForm = (formData: FormData): PasteInput => ({
	title: formString(formData, 'title'),
	alias: formString(formData, 'alias'),
	language: formString(formData, 'language'),
	content: formString(formData, 'content'),
	contentHtml: formString(formData, 'contentHtml')
});
