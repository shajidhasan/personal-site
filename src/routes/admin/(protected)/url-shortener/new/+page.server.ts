import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parseLinkForm, validateLink } from '$lib/server/link-form';

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = validateLink(parseLinkForm(await request.formData()));
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.insert(shortLink).values(parsed.values);
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create shortlink.' });
		}

		return { message: 'Shortlink created!', alias: parsed.values.alias };
	}
};
