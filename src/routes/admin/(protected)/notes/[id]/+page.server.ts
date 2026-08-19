import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { note } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parseNoteForm, validateNote } from '$lib/server/note-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundNote] = await db.select().from(note).where(eq(note.id, params.id));
	if (!foundNote) error(404, 'Note not found');

	return { note: foundNote };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		// The alias field is prefilled on this form, so an empty one must not silently re-alias.
		const parsed = validateNote(parseNoteForm(await request.formData()), { requireAlias: true });
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.update(note).set(parsed.values).where(eq(note.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update note. Please try again.' });
		}

		return { message: 'Note updated.', alias: parsed.values.alias };
	}
};
