import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { project } from '$lib/server/db/schema';
import { parseProjectForm } from '$lib/server/project-form';
import { isUniqueConstraintError } from '$lib/server/blog-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [item] = await db.select().from(project).where(eq(project.id, params.id));
	if (!item) error(404, 'Project not found');

	return { project: item };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const parsed = parseProjectForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error, errors: parsed.errors });

		try {
			await getDb(platform!.env.DB)
				.update(project)
				.set(parsed.values)
				.where(eq(project.id, params.id));
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'That slug is already taken.',
					errors: { slug: 'This slug is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to update project.' });
		}
		return {};
	}
};
