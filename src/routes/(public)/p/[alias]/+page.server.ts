import { getDb, trackVisit } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const foundPaste = await db.query.paste.findFirst({
		where: eq(paste.alias, params.alias)
	});

	if (!foundPaste) {
		error(404);
	}

	trackVisit(platform, () =>
		db
			.update(paste)
			.set({ visitCount: sql`${paste.visitCount} + 1` })
			.where(eq(paste.id, foundPaste.id))
	);

	const pageMetaTags = Object.freeze({
		title: `${foundPaste.title} - Pastebin`,
		description: 'A private code or text snippet shared by Shajid Hasan Naim.',
		robots: 'noindex',
		openGraph: {
			title: `${foundPaste.title} - Pastebin`,
			description: 'A private code or text snippet shared by Shajid Hasan Naim.'
		}
	}) satisfies MetaTagsProps;

	// contentHtml is the shiki-highlighted code, rendered at save time
	return { paste: foundPaste, highlightedCode: foundPaste.contentHtml, pageMetaTags };
};
