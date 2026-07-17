import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { post } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const blogPosts = await db.select().from(post).orderBy(desc(post.createdAt));

	return { blogPosts };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing post id.' });

		const db = getDb(platform!.env.DB);

		try {
			await db.delete(post).where(eq(post.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete blog post.' });
		}

		return { message: 'Blog post deleted successfully.' };
	},

	togglePublish: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing post id.' });

		const db = getDb(platform!.env.DB);

		const [existing] = await db.select().from(post).where(eq(post.id, id));
		if (!existing) return fail(404, { message: 'Blog post not found.' });

		const newStatus = !existing.isPublished;

		try {
			await db
				.update(post)
				.set({
					isPublished: newStatus,
					publishedAt: newStatus && !existing.publishedAt ? new Date() : existing.publishedAt
				})
				.where(eq(post.id, id));
		} catch {
			return fail(500, { message: 'Failed to update publish status.' });
		}

		return {
			message: `Post "${existing.title}" has been ${newStatus ? 'published' : 'unpublished'}.`
		};
	}
};
