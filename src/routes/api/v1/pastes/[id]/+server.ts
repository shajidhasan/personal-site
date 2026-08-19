import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { jsonError, requireSession } from '$lib/server/api-auth';

export const DELETE = async ({ locals, params, platform }) => {
	requireSession(locals);
	const db = getDb(platform!.env.DB);

	const deleted = await db.delete(paste).where(eq(paste.id, params.id)).returning({ id: paste.id });
	if (deleted.length === 0) return jsonError(404, 'Paste not found.');

	return new Response(null, { status: 204 });
};
