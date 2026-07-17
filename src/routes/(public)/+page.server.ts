import { getDb } from '$lib/server/db';
import { post, project, researchPaper } from '$lib/server/db/schema';
import { and, asc, desc, eq } from 'drizzle-orm';

export const load = async ({ platform }) => {
	const db = getDb(platform!.env.DB);

	const [blogPosts, projects, featuredPapers] = await Promise.all([
		db
			.select()
			.from(post)
			.where(eq(post.isPublished, true))
			.orderBy(desc(post.publishedAt))
			.limit(4),
		db.select().from(project).orderBy(asc(project.sortOrder)).limit(4),
		db
			.select()
			.from(researchPaper)
			.where(and(eq(researchPaper.isPublished, true), eq(researchPaper.isFeatured, true)))
			.orderBy(desc(researchPaper.year), asc(researchPaper.sortOrder))
			.limit(3)
	]);

	return {
		blogPosts,
		projects,
		featuredPapers
	};
};
