import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { note } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { validateNote } from '$lib/server/note-form';
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
			id: note.id,
			title: note.title,
			alias: note.alias,
			visitCount: note.visitCount,
			createdAt: note.createdAt
		})
		.from(note)
		.orderBy(desc(note.createdAt));

	return json({
		items: rows.map((row) => ({ ...row, url: resourceUrl(url.origin, 'n', row.alias) }))
	});
};

export const POST = async ({ locals, platform, request, url }) => {
	requireSession(locals);

	const parsedBody = await parseJsonBody(request);
	if (!parsedBody.body) return jsonError(400, parsedBody.error);

	const { overwrite, ...input } = parsedBody.body;
	const typeError = checkStringFields(input, ['title', 'alias', 'content', 'contentHtml']);
	if (typeError) return jsonError(400, typeError);

	const parsed = validateNote(input);
	if (!parsed.values) return jsonError(400, parsed.error);

	const db = getDb(platform!.env.DB);
	const { alias } = parsed.values;

	try {
		const [row] = await db.insert(note).values(parsed.values).returning({ id: note.id });
		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'n', alias) }, { status: 201 });
	} catch (e) {
		if (!isUniqueConstraintError(e)) throw e;

		if (!isTrue(overwrite)) {
			return jsonError(409, `Alias "${alias}" is already taken.`);
		}

		const [row] = await db
			.update(note)
			.set(parsed.values)
			.where(eq(note.alias, alias))
			.returning({ id: note.id });

		return json({ id: row.id, alias, url: resourceUrl(url.origin, 'n', alias) });
	}
};
