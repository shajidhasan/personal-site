import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parsePasteForm, validatePaste } from '$lib/server/paste-form';

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = validatePaste(parsePasteForm(await request.formData()));
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.insert(paste).values(parsed.values);
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create paste.' });
		}

		return { message: 'New paste created!', alias: parsed.values.alias };
	}
};
