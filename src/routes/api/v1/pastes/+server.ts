import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { validatePaste } from '$lib/server/paste-form';
import { jsonError, requireSession, resourceUrl } from '$lib/server/api-auth';

export const GET = async ({ locals, platform, url }) => {
	requireSession(locals);
	const db = getDb(platform!.env.DB);

	const rows = await db
		.select({
			id: paste.id,
			title: paste.title,
			alias: paste.alias,
			language: paste.language,
			visitCount: paste.visitCount,
			createdAt: paste.createdAt
		})
		.from(paste)
		.orderBy(desc(paste.createdAt));

	return json({
		items: rows.map((row) => ({ ...row, url: resourceUrl(url.origin, 'p', row.alias) }))
	});
};

export const POST = async ({ locals, platform, request, url }) => {
	requireSession(locals);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonError(400, 'Body must be valid JSON.');
	}

	const { overwrite = false, ...input } = (body ?? {}) as Record<string, unknown>;
	const parsed = validatePaste(input);
	if (!parsed.values) return jsonError(400, parsed.error);

	const db = getDb(platform!.env.DB);
	const { alias } = parsed.values;

	try {
		const [row] = await db.insert(paste).values(parsed.values).returning({ id: paste.id });
		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'p', alias) }, { status: 201 });
	} catch (e) {
		if (!isUniqueConstraintError(e)) throw e;

		if (!overwrite) {
			return jsonError(409, `Alias "${alias}" is already taken.`);
		}

		const [row] = await db
			.update(paste)
			.set(parsed.values)
			.where(eq(paste.alias, alias))
			.returning({ id: paste.id });

		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'p', alias) });
	}
};
