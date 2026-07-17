import { asc } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getDb } from '$lib/server/db';
import { project } from '$lib/server/db/schema';

export const load = async ({ platform, parent }) => {
	const [{ settings }, projects] = await Promise.all([
		parent(),
		getDb(platform!.env.DB).select().from(project).orderBy(asc(project.sortOrder))
	]);

	const meta = settings.seo.pages.projects;
	const pageMetaTags = Object.freeze({
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description
		}
	}) satisfies MetaTagsProps;

	return {
		projects,
		pageMetaTags
	};
};
