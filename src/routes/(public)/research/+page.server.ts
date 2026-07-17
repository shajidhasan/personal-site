import { asc, desc, eq } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getDb } from '$lib/server/db';
import { researchPaper } from '$lib/server/db/schema';

export const load = async ({ platform, parent }) => {
	const [{ settings }, papers] = await Promise.all([
		parent(),
		getDb(platform!.env.DB)
			.select()
			.from(researchPaper)
			.where(eq(researchPaper.isPublished, true))
			.orderBy(desc(researchPaper.year), asc(researchPaper.sortOrder))
	]);

	const meta = settings.seo.pages.research;
	const pageMetaTags = Object.freeze({
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description
		}
	}) satisfies MetaTagsProps;

	return {
		papers,
		pageMetaTags
	};
};
