import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { isUniqueConstraintError, parseBlogForm } from '$lib/server/blog-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [blogPost] = await db.select().from(post).where(eq(post.id, params.id));
	if (!blogPost) error(404, 'Blog post not found');

	return { blogPost };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const parsed = parseBlogForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error });

		const db = getDb(platform!.env.DB);

		try {
			await db.update(post).set(parsed.values).where(eq(post.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This slug is already taken.',
					errors: { slug: 'This slug is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update blog post. Please try again.' });
		}

		return { message: 'Blog post updated.' };
	}
};
