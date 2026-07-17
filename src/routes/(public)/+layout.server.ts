import { count, eq } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getDb } from '$lib/server/db';
import { researchPaper } from '$lib/server/db/schema';
import { getSettings } from '$lib/server/settings';

export const load = async ({ url, platform }) => {
	const db = getDb(platform!.env.DB);

	const [settings, research] = await Promise.all([
		getSettings(db),
		db.select({ value: count() }).from(researchPaper).where(eq(researchPaper.isPublished, true))
	]);

	const baseMetaTags = Object.freeze({
		title: settings.seo.siteTitle,
		description: settings.seo.siteDescription,
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			locale: 'en_IE',
			title: settings.seo.siteTitle,
			description: settings.seo.siteDescription,
			siteName: settings.seo.siteName,
			images: [
				{
					url: settings.seo.ogImageUrl,
					alt: settings.identity.fullName,
					width: 1200,
					height: 630,
					secureUrl: settings.seo.ogImageUrl,
					type: 'image/jpeg'
				}
			]
		}
	}) satisfies MetaTagsProps;

	return {
		settings,
		hasResearch: research[0].value > 0,
		baseMetaTags
	};
};
