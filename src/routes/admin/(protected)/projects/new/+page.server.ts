import { fail } from '@sveltejs/kit';
import { count } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { project } from '$lib/server/db/schema';
import { parseProjectForm } from '$lib/server/project-form';
import { isUniqueConstraintError } from '$lib/server/blog-form';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);
	const [row] = await db.select({ count: count() }).from(project);
	return { projectCount: row?.count ?? 0 };
};

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = parseProjectForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error, errors: parsed.errors });

		try {
			await getDb(platform!.env.DB).insert(project).values(parsed.values);
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'That slug is already taken.',
					errors: { slug: 'This slug is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create project.' });
		}
		return {};
	}
};
