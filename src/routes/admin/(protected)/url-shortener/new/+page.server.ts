import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { generateRandomString } from '$lib/utilities';

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

export const actions = {
	default: async ({ request, platform }) => {
		const values = parseLinkForm(await request.formData());
		if (!values.destinationUrl) {
			return fail(400, {
				message: 'Destination URL is required.',
				errors: { destinationUrl: 'Destination URL is required.' }
			});
		}

		const db = getDb(platform!.env.DB);
		const alias = values.alias || generateRandomString(4);

		try {
			await db.insert(shortLink).values({ ...values, alias });
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create shortlink.' });
		}

		return { message: 'Shortlink created!', alias };
	}
};
