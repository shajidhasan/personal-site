import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const shortLinks = await db.select().from(shortLink).orderBy(desc(shortLink.createdAt));

	return { shortLinks };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing shortlink id.' });

		const db = getDb(platform!.env.DB);

		try {
			await db.delete(shortLink).where(eq(shortLink.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete shortlink.' });
		}

		return { message: 'Shortlink deleted successfully!' };
	}
};
