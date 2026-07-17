import { fail } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { researchPaper } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);
	const papers = await db
		.select()
		.from(researchPaper)
		.orderBy(desc(researchPaper.year), asc(researchPaper.sortOrder));
	return { papers };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing paper id.' });

		try {
			await getDb(platform!.env.DB).delete(researchPaper).where(eq(researchPaper.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete the paper.' });
		}
		return {};
	}
};
