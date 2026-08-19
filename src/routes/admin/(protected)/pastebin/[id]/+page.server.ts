import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parsePasteForm, validatePaste } from '$lib/server/paste-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundPaste] = await db.select().from(paste).where(eq(paste.id, params.id));
	if (!foundPaste) error(404, 'Paste not found');

	return { paste: foundPaste };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		// The alias field is prefilled on this form, so an empty one must not silently re-alias.
		const parsed = validatePaste(parsePasteForm(await request.formData()), { requireAlias: true });
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.update(paste).set(parsed.values).where(eq(paste.id, params.id));
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
