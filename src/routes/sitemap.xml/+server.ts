import { getDb } from '$lib/server/db';
import { post, researchPaper } from '$lib/server/db/schema';
import { count, desc, eq } from 'drizzle-orm';

const SITE = 'https://sh4jid.me';

export const GET = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const [posts, research] = await Promise.all([
		db
			.select({
				slug: post.slug,
				updatedAt: post.updatedAt
			})
			.from(post)
			.where(eq(post.isPublished, true))
			.orderBy(desc(post.publishedAt)),
		db.select({ value: count() }).from(researchPaper).where(eq(researchPaper.isPublished, true))
	]);

	const staticPages = ['', '/blog', '/projects'];
	// /research only exists publicly while there are published papers
	if (research[0].value > 0) staticPages.push('/research');

	const urls = [
		...staticPages.map((path) => `<url><loc>${SITE}${path}</loc></url>`),
		...posts.map((p) => {
			const lastmod = p.updatedAt.toISOString().split('T')[0];
			return `<url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
		})
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600'
		}
	});
};
