import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';

const parseLinkForm = (formData: FormData) => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	return {
		destinationUrl: str('destinationUrl').trim(),
		alias: str('alias').trim(),
		message: str('message').trim() || null
	};
};

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [foundLink] = await db.select().from(shortLink).where(eq(shortLink.id, params.id));
	if (!foundLink) error(404, 'Shortlink not found');

	return { shortLink: foundLink };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const values = parseLinkForm(await request.formData());
		if (!values.destinationUrl) {
			return fail(400, {
				message: 'Destination URL is required.',
				errors: { destinationUrl: 'Destination URL is required.' }
			});
		}
		if (!values.alias) {
			return fail(400, { message: 'Alias is required.', errors: { alias: 'Alias is required.' } });
		}

		const db = getDb(platform!.env.DB);

		try {
			await db.update(shortLink).set(values).where(eq(shortLink.id, params.id));
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
