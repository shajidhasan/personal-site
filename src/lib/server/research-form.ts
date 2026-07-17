import type { researchPaper } from '$lib/server/db/schema';

type ResearchFormValues = Omit<typeof researchPaper.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

type ParseResult =
	| { error: string; errors?: Record<string, string>; values?: never }
	| { error?: never; values: ResearchFormValues };

export const parseResearchForm = (formData: FormData): ParseResult => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	const title = str('title').trim();
	const url = str('url').trim();
	const year = Number.parseInt(str('year'), 10);

	// One author per line
	const authors = str('authors')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	const errors: Record<string, string> = {};
	if (!title) errors.title = 'Title is required.';
	if (authors.length === 0) errors.authors = 'At least one author is required.';
	if (!Number.isInteger(year) || year < 1900 || year > 2100) errors.year = 'Enter a valid year.';
	if (!url) errors.url = 'A link to the paper is required.';
	else if (!/^https?:\/\//.test(url)) errors.url = 'Must be an http(s) URL.';

	if (Object.keys(errors).length > 0) {
		return { error: 'Please fix the highlighted fields.', errors };
	}

	const tags = str('tags')
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean);

	return {
		values: {
			title,
			authors,
			venue: str('venue').trim() || null,
			year,
			abstract: str('abstract').trim() || null,
			doi: str('doi').trim() || null,
			url,
			tags,
			isPublished: str('isPublished') === 'true',
			isFeatured: str('isFeatured') === 'true',
			sortOrder: Number.parseInt(str('sortOrder'), 10) || 0
		}
	};
};
