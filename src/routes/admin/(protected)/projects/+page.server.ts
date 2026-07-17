import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { project } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);
	const projects = await db.select().from(project).orderBy(asc(project.sortOrder));
	return { projects };
};

export const actions = {
	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing project id.' });

		try {
			await getDb(platform!.env.DB).delete(project).where(eq(project.id, id));
		} catch {
			return fail(500, { message: 'Failed to delete project.' });
		}
		return {};
	}
};
