import { error, json } from '@sveltejs/kit';

// hooks.server.ts already calls auth.api.getSession() on every request. The apiKey plugin
// registers a get-session hook, so an `x-api-key` header resolves through that same call
// (as does `Authorization: Bearer`, via the bearer plugin) — the guard is just a check.
// Unlike the admin layout, it must not redirect to HTML.
export const requireSession = (locals: App.Locals): void => {
	if (!locals.session) {
		error(401, 'Unauthorized. Run `sh4 login`.');
	}
};

export const jsonError = (status: number, message: string): Response =>
	json({ message }, { status });

export const resourceUrl = (origin: string, prefix: 'n' | 'p' | 'l', alias: string): string =>
	`${origin.replace(/\/$/, '')}/${prefix}/${alias}`;

/**
 * JSON bodies are attacker-shaped, but the validators call string methods on their fields.
 * Reject wrong types here so `{"title": 123}` is a 400 rather than a 500 from `.trim()`.
 * Returns an error message, or null when every present field is a string.
 */
export const checkStringFields = (
	body: Record<string, unknown>,
	fields: string[]
): string | null => {
	for (const field of fields) {
		const value = body[field];
		if (value === undefined || value === null) continue;
		if (typeof value !== 'string') return `"${field}" must be a string.`;
	}
	return null;
};

/** JSON `true` only — a bare "false" string would otherwise read as truthy and overwrite. */
export const isTrue = (value: unknown): boolean => value === true;

export const parseJsonBody = async (
	request: Request
): Promise<{ error: string; body?: never } | { error?: never; body: Record<string, unknown> }> => {
	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		return { error: 'Body must be valid JSON.' };
	}

	// Arrays and primitives would silently spread into nothing; require a plain object.
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		return { error: 'Body must be a JSON object.' };
	}

	return { body: parsed as Record<string, unknown> };
};
