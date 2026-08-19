import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { note } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parseNoteForm, validateNote } from '$lib/server/note-form';

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = validateNote(parseNoteForm(await request.formData()));
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.insert(note).values(parsed.values);
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create note. Please try again.' });
		}

		return { message: 'Note created.', alias: parsed.values.alias };
	}
};
