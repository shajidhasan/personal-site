import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shortLink } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { validateLink } from '$lib/server/link-form';
import {
	checkStringFields,
	isTrue,
	jsonError,
	parseJsonBody,
	requireSession,
	resourceUrl
} from '$lib/server/api-auth';

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

	const parsedBody = await parseJsonBody(request);
	if (!parsedBody.body) return jsonError(400, parsedBody.error);

	const { overwrite, ...input } = parsedBody.body;
	const typeError = checkStringFields(input, ['destinationUrl', 'alias', 'message']);
	if (typeError) return jsonError(400, typeError);

	const parsed = validateLink(input);
	if (!parsed.values) return jsonError(400, parsed.error);

	const db = getDb(platform!.env.DB);
	const { alias } = parsed.values;

	try {
		const [row] = await db.insert(shortLink).values(parsed.values).returning({ id: shortLink.id });
		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'l', alias) }, { status: 201 });
	} catch (e) {
		if (!isUniqueConstraintError(e)) throw e;

		if (!isTrue(overwrite)) {
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
