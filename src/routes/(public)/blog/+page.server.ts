import { getDb } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ platform, parent }) => {
	const { settings } = await parent();
	const db = getDb(platform!.env.DB);

	const blogPosts = await db
		.select()
		.from(post)
		.where(eq(post.isPublished, true))
		.orderBy(desc(post.publishedAt));

	const meta = settings.seo.pages.blog;
	const pageMetaTags = Object.freeze({
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description
		}
	}) satisfies MetaTagsProps;

	return {
		blogPosts,
		pageMetaTags
	};
};
