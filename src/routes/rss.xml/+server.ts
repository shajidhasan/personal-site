import { getDb } from '$lib/server/db';
import { getSettings } from '$lib/server/settings';
import { post } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

const SITE = 'https://sh4jid.me';

const escapeXml = (text: string): string =>
	text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export const GET = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const settings = await getSettings(db);
	const posts = await db
		.select({
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt,
			publishedAt: post.publishedAt,
			tags: post.tags
		})
		.from(post)
		.where(eq(post.isPublished, true))
		.orderBy(desc(post.publishedAt))
		.limit(20);

	const items = posts
		.map((p) => {
			const url = `${SITE}/blog/${p.slug}`;
			return `<item>
<title>${escapeXml(p.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<description>${escapeXml(p.excerpt)}</description>
${p.publishedAt ? `<pubDate>${p.publishedAt.toUTCString()}</pubDate>` : ''}
${p.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n')}
</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(settings.seo.siteTitle)}</title>
<link>${SITE}</link>
<description>${escapeXml(settings.seo.siteDescription)}</description>
<language>en</language>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/rss+xml',
			'cache-control': 'public, max-age=3600'
		}
	});
};
