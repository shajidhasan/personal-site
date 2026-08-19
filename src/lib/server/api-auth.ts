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
