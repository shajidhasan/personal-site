import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { parseLinkForm, validateLink } from '$lib/server/link-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundLink] = await db.select().from(shortLink).where(eq(shortLink.id, params.id));
	if (!foundLink) error(404, 'Shortlink not found');

	return { shortLink: foundLink };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		// The alias field is prefilled on this form, so an empty one must not silently re-alias.
		const parsed = validateLink(parseLinkForm(await request.formData()), { requireAlias: true });
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.update(shortLink).set(parsed.values).where(eq(shortLink.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update shortlink.' });
		}

		return { message: 'Shortlink updated successfully!' };
	}
};
