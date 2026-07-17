import type { project } from '$lib/server/db/schema';

type ProjectFormValues = Omit<typeof project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

type ParseResult =
	| { error: string; errors?: Record<string, string>; values?: never }
	| { error?: never; values: ProjectFormValues };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const parseProjectForm = (formData: FormData): ParseResult => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	const title = str('title').trim();
	const slug = str('slug').trim();
	const description = str('description').trim();
	const url = str('url').trim();

	const errors: Record<string, string> = {};
	if (!title) errors.title = 'Title is required.';
	if (!slug) errors.slug = 'Slug is required.';
	else if (!SLUG_PATTERN.test(slug)) errors.slug = 'Use lowercase letters, numbers, and hyphens.';
	if (!description) errors.description = 'Description is required.';
	if (!url) errors.url = 'URL is required.';
	else if (!/^https?:\/\//.test(url)) errors.url = 'Must be an http(s) URL.';

	if (Object.keys(errors).length > 0) {
		return { error: 'Please fix the highlighted fields.', errors };
	}

	return {
		values: {
			title,
			slug,
			description,
			url,
			iconUrl: str('iconUrl').trim() || null,
			isWip: str('isWip') === 'true',
			sortOrder: Number.parseInt(str('sortOrder'), 10) || 0
		}
	};
};
