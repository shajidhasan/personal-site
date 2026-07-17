import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { note } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const notes = await db.select().from(note).orderBy(desc(note.createdAt));

	return { notes };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing note id.' });

		const db = getDb(platform!.env.DB);

		try {
			await db.delete(note).where(eq(note.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete note.' });
		}

		return { message: 'Note deleted successfully!' };
	}
};
