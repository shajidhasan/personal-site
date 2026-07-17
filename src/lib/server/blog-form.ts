import type { post } from '$lib/server/db/schema';

type BlogFormValues = Omit<
	typeof post.$inferInsert,
	'id' | 'visitCount' | 'createdAt' | 'updatedAt'
>;

type ParseResult = { error: string; values?: never } | { error?: never; values: BlogFormValues };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Shared parser for the create and update blog post form actions. Content HTML is
// rendered in the browser before submit (see BlogForm pages) and arrives as
// hidden inputs — the server never touches the markdown pipeline.
export const parseBlogForm = (formData: FormData): ParseResult => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	const title = str('title').trim();
	const slug = str('slug').trim();
	const content = str('content');
	const contentHtml = str('contentHtml');

	if (!title || !slug || !content.trim()) {
		return { error: 'Title, Slug, and Content are required.' };
	}
	if (!SLUG_PATTERN.test(slug)) {
		return { error: 'Slug format is invalid. Use lowercase alphanumeric and hyphens.' };
	}
	if (!contentHtml) {
		return { error: 'Rendered content is missing. Please try saving again.' };
	}

	const tags = str('tags')
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter((tag) => tag !== '');

	const publishedAtStr = str('publishedAt').trim();
	const readTimeMinutes = Math.max(1, Number.parseInt(str('readTimeMinutes'), 10) || 1);

	return {
		values: {
			title,
			slug,
			excerpt: str('excerpt').trim(),
			content,
			contentHtml,
			featuredImageUrl: str('featuredImageUrl').trim() || null,
			tags,
			readTimeMinutes,
			isPublished: str('isPublished') === 'true',
			publishedAt: publishedAtStr ? new Date(publishedAtStr) : null
		}
	};
};

// drizzle wraps DB errors in DrizzleQueryError with the original error on
// `.cause`, so walk the cause chain looking for the UNIQUE constraint message.
export const isUniqueConstraintError = (e: unknown): boolean => {
	for (let err = e; err instanceof Error; err = err.cause) {
		if (err.message.toUpperCase().includes('UNIQUE')) return true;
	}
	return false;
};
