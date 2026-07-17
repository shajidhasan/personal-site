import { getDb, trackVisit } from '$lib/server/db';
import { note } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ params, platform }) => {
	const db = getDb(platform!.env.DB);

	const foundNote = await db.query.note.findFirst({
		where: eq(note.alias, params.alias)
	});

	if (!foundNote) {
		error(404);
	}

	trackVisit(platform, () =>
		db
			.update(note)
			.set({ visitCount: sql`${note.visitCount} + 1` })
			.where(eq(note.id, foundNote.id))
	);

	const pageMetaTags = Object.freeze({
		title: `${foundNote.title} - Notes`,
		description: 'A private note shared by Shajid Hasan Naim.',
		robots: 'noindex',
		openGraph: {
			title: `${foundNote.title} - Notes`,
			description: 'A private note shared by Shajid Hasan Naim.'
		}
	}) satisfies MetaTagsProps;

	return { note: foundNote, htmlNote: foundNote.contentHtml, pageMetaTags };
};
