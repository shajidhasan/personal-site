import { getDb, trackVisit } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const link = await db.query.shortLink.findFirst({
		where: eq(shortLink.alias, params.alias)
	});

	if (!link) {
		error(404);
	}

	trackVisit(platform, () =>
		db
			.update(shortLink)
			.set({ visitCount: sql`${shortLink.visitCount} + 1` })
			.where(eq(shortLink.id, link.id))
	);

	if (link.message && link.message.length > 0) {
		const pageMetaTags = Object.freeze({
			title: `Link Redirect`,
			description: 'A short link shared by Shajid Hasan Naim.',
			robots: 'noindex',
			openGraph: {
				title: `Link Redirect`,
				description: 'A short link shared by Shajid Hasan Naim.'
			}
		}) satisfies MetaTagsProps;

		return { shortLink: link, pageMetaTags };
	}

	redirect(301, link.destinationUrl);
};
