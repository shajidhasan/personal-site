import { getDb, trackVisit } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ params, platform, locals, url, parent }) => {
	const { settings } = await parent();
	const db = getDb(platform!.env.DB);

	// Logged-in admin can preview drafts; everyone else only sees published posts
	const blogPost = await db.query.post.findFirst({
		where: and(eq(post.slug, params.slug), locals.session ? undefined : eq(post.isPublished, true))
	});

	if (!blogPost) {
		error(404);
	}

	if (!locals.session) {
		trackVisit(platform, () =>
			db
				.update(post)
				.set({ visitCount: sql`${post.visitCount} + 1` })
				.where(eq(post.id, blogPost.id))
		);
	}

	const featuredImageUrl = blogPost.featuredImageUrl
		? new URL(blogPost.featuredImageUrl, url.origin).href
		: undefined;

	const pageMetaTags = Object.freeze({
		title: `${blogPost.title} - ${settings.identity.fullName}`,
		description: blogPost.excerpt,
		canonical: `https://sh4jid.me/blog/${blogPost.slug}`,
		keywords: blogPost.tags,
		openGraph: {
			title: `${blogPost.title} - ${settings.identity.fullName}`,
			description: blogPost.excerpt,
			type: 'article',
			url: `https://sh4jid.me/blog/${blogPost.slug}`,
			publishedTime: blogPost.publishedAt?.toISOString(),
			tags: blogPost.tags,
			images: featuredImageUrl
				? [
						{
							url: featuredImageUrl,
							alt: blogPost.title,
							secureUrl: featuredImageUrl,
							type: 'image/jpeg'
						}
					]
				: []
		},
		twitter: {
			title: `${blogPost.title} - ${settings.identity.fullName}`,
			description: blogPost.excerpt,
			images: featuredImageUrl ? [featuredImageUrl] : [],
			site: '@sh4jid'
		}
	}) satisfies MetaTagsProps;

	return { blogPost, contentHtml: blogPost.contentHtml, pageMetaTags };
};
