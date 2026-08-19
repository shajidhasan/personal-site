import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { validatePaste } from '$lib/server/paste-form';
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

	const parsedBody = await parseJsonBody(request);
	if (!parsedBody.body) return jsonError(400, parsedBody.error);

	const { overwrite, ...input } = parsedBody.body;
	const typeError = checkStringFields(input, [
		'title',
		'alias',
		'language',
		'content',
		'contentHtml'
	]);
	if (typeError) return jsonError(400, typeError);

	const parsed = validatePaste(input);
	if (!parsed.values) return jsonError(400, parsed.error);

	const db = getDb(platform!.env.DB);
	const { alias } = parsed.values;

	try {
		const [row] = await db.insert(paste).values(parsed.values).returning({ id: paste.id });
		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'p', alias) }, { status: 201 });
	} catch (e) {
		if (!isUniqueConstraintError(e)) throw e;

		if (!isTrue(overwrite)) {
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
