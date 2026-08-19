import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { createAuth } from '$lib/server/auth';
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

	// The apiKey plugin throws when an x-api-key header is present but revoked or malformed.
	// That must read as "not signed in", not fail the whole request with a 500 — otherwise a
	// stale CLI credential breaks every route it touches instead of prompting a re-login.
	const session = await auth.api.getSession({ headers: event.request.headers }).catch(() => null);

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
