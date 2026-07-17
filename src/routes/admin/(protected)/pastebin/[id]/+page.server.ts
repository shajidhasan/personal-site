import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';

const parsePasteForm = (formData: FormData) => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	return {
		title: str('title').trim(),
		alias: str('alias').trim(),
		language: str('language').trim() || 'plaintext',
		content: str('content'),
		contentHtml: str('contentHtml')
	};
};

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundPaste] = await db.select().from(paste).where(eq(paste.id, params.id));
	if (!foundPaste) error(404, 'Paste not found');

	return { paste: foundPaste };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const values = parsePasteForm(await request.formData());
		if (!values.title) {
			return fail(400, { message: 'Title is required.', errors: { title: 'Title is required.' } });
		}
		if (!values.alias) {
			return fail(400, { message: 'Alias is required.', errors: { alias: 'Alias is required.' } });
		}
		if (!values.content.trim()) {
			return fail(400, { message: 'Content is required.' });
		}

		const db = getDb(platform!.env.DB);

		try {
			await db.update(paste).set(values).where(eq(paste.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update paste.' });
		}

		return { message: 'Paste updated successfully!' };
	}
};
