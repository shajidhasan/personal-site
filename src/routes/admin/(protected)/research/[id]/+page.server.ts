import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { researchPaper } from '$lib/server/db/schema';
import { parseResearchForm } from '$lib/server/research-form';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const [paper] = await db.select().from(researchPaper).where(eq(researchPaper.id, params.id));
	if (!paper) error(404, 'Paper not found');

	return { paper };
};

export const actions = {
	default: async ({ params, request, platform }) => {
		const parsed = parseResearchForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error, errors: parsed.errors });

		try {
			await getDb(platform!.env.DB)
				.update(researchPaper)
				.set(parsed.values)
				.where(eq(researchPaper.id, params.id));
		} catch {
			return fail(500, { message: 'Failed to update the paper.' });
		}
		return {};
	}
};
