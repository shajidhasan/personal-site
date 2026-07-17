import { count, desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { post, note, paste, shortLink, project, researchPaper } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const [posts, drafts, notes, pastes, links, projects, papers, recentPosts] = await Promise.all([
		db.select({ value: count() }).from(post),
		db.select({ value: count() }).from(post).where(eq(post.isPublished, false)),
		db.select({ value: count() }).from(note),
		db.select({ value: count() }).from(paste),
		db.select({ value: count() }).from(shortLink),
		db.select({ value: count() }).from(project),
		db.select({ value: count() }).from(researchPaper),
		db
			.select({
				id: post.id,
				title: post.title,
				slug: post.slug,
				isPublished: post.isPublished,
				visitCount: post.visitCount,
				updatedAt: post.updatedAt
			})
			.from(post)
			.orderBy(desc(post.updatedAt))
			.limit(5)
	]);

	return {
		stats: {
			posts: posts[0].value,
			drafts: drafts[0].value,
			notes: notes[0].value,
			pastes: pastes[0].value,
			links: links[0].value,
			projects: projects[0].value,
			papers: papers[0].value
		},
		recentPosts
	};
};
