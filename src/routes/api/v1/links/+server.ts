import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { validateLink } from '$lib/server/link-form';
import { jsonError, requireSession, resourceUrl } from '$lib/server/api-auth';

export const GET = async ({ locals, platform, url }) => {
	requireSession(locals);
	const db = getDb(platform!.env.DB);

	// short_link has no title column — the destination is what identifies it in a list.
	const rows = await db
		.select({
			id: shortLink.id,
			destinationUrl: shortLink.destinationUrl,
			alias: shortLink.alias,
			visitCount: shortLink.visitCount,
			createdAt: shortLink.createdAt
		})
		.from(shortLink)
		.orderBy(desc(shortLink.createdAt));

	return json({
		items: rows.map((row) => ({ ...row, url: resourceUrl(url.origin, 'l', row.alias) }))
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
	const parsed = validateLink(input);
	if (!parsed.values) return jsonError(400, parsed.error);

	const db = getDb(platform!.env.DB);
	const { alias } = parsed.values;

	try {
		const [row] = await db.insert(shortLink).values(parsed.values).returning({ id: shortLink.id });
		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'l', alias) }, { status: 201 });
	} catch (e) {
		if (!isUniqueConstraintError(e)) throw e;

		if (!overwrite) {
			return jsonError(409, `Alias "${alias}" is already taken.`);
		}

		const [row] = await db
			.update(shortLink)
			.set(parsed.values)
			.where(eq(shortLink.alias, alias))
			.returning({ id: shortLink.id });

		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'l', alias) });
	}
};
