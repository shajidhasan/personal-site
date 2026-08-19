import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { API_KEY_SCOPE, createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

// The old site's canonical host was www; the worker serves both but apex is canonical.
const handleCanonicalHost: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === 'www.sh4jid.me') {
		redirect(301, `https://sh4jid.me${event.url.pathname}${event.url.search}`);
	}
	return resolve(event);
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env?.DB)
		throw new Error('D1 binding "DB" not found - are you running with wrangler?');

	event.locals.auth = createAuth(event.platform.env.DB);

	const { auth } = event.locals;

	// An API key resolves to a full session, so it must only work on the CLI's own surface.
	// better-auth's own routes are covered by customAPIKeyGetter in auth.ts, but that getter
	// sees no request object on this direct call — so scope it here too, or a key would
	// authenticate /admin. Two code paths, two guards.
	const usedApiKey = event.request.headers.has('x-api-key');
	let headers = event.request.headers;
	if (usedApiKey && !event.url.pathname.startsWith(API_KEY_SCOPE)) {
		headers = new Headers(headers);
		headers.delete('x-api-key');
	}

	// A revoked or malformed key makes the apiKey plugin throw; that must read as "not signed
	// in" rather than a 500, so a stale CLI credential prompts a re-login instead of breaking
	// every route. Only swallow it for key-bearing requests — a transient D1 failure on a
	// normal request should surface as an error, not masquerade as a revoked credential.
	const session = usedApiKey
		? await auth.api.getSession({ headers }).catch(() => null)
		: await auth.api.getSession({ headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

// Layout guards don't cover +server.ts endpoints or form actions, so gate all of
// /admin (except the login page) here as well.
const handleAdminGuard: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !event.locals.session) {
		redirect(302, '/admin/login');
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleCanonicalHost, handleBetterAuth, handleAdminGuard);
