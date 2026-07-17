import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { note } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { generateRandomString } from '$lib/utilities';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundNote] = await db.select().from(note).where(eq(note.id, params.id));
	if (!foundNote) error(404, 'Note not found');

	return { note: foundNote };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const formData = await request.formData();
		const title = ((formData.get('title') as string | null) ?? '').trim();
		const alias = ((formData.get('alias') as string | null) ?? '').trim();
		const content = (formData.get('content') as string | null) ?? '';
		const contentHtml = (formData.get('contentHtml') as string | null) ?? '';

		if (!title) {
			return fail(400, { message: 'Title is required.', errors: { title: 'Title is required.' } });
		}

		const db = getDb(platform!.env.DB);

		try {
			await db
				.update(note)
				.set({
					title,
					alias: alias || generateRandomString(8).toLowerCase(),
					content,
					contentHtml
				})
				.where(eq(note.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update note. Please try again.' });
		}

		return { message: 'Note updated.' };
	}
};
