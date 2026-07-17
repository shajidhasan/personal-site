import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { isUniqueConstraintError, parseBlogForm } from '$lib/server/blog-form';

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = parseBlogForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.insert(post).values(parsed.values);
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This slug is already taken.',
					errors: { slug: 'This slug is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create blog post. Please try again.' });
		}

		return { message: 'Blog post created.' };
	}
};
