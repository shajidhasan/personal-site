import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const pastes = await db.select().from(paste).orderBy(desc(paste.createdAt));

	return { pastes };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing paste id.' });

		const db = getDb(platform!.env.DB);

		try {
			await db.delete(paste).where(eq(paste.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete paste.' });
		}

		return { message: 'Paste deleted successfully!' };
	}
};
