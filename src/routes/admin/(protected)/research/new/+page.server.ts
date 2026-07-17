import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { researchPaper } from '$lib/server/db/schema';
import { parseResearchForm } from '$lib/server/research-form';

export const actions = {
	default: async ({ request, platform }) => {
		const parsed = parseResearchForm(await request.formData());
		if (!parsed.values) return fail(400, { message: parsed.error, errors: parsed.errors });

		try {
			await getDb(platform!.env.DB).insert(researchPaper).values(parsed.values);
		} catch {
			return fail(500, { message: 'Failed to add the paper.' });
		}
		return {};
	}
};
