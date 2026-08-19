import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { apiKey, bearer, deviceAuthorization } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';

/** The only path prefix on which an `x-api-key` header is honoured. */
export const API_KEY_SCOPE = '/api/v1';

const authConfig = {
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	// Single-admin site: signups only allowed when ALLOW_SIGNUP=true (used once to seed the admin)
	emailAndPassword: { enabled: true, disableSignUp: env.ALLOW_SIGNUP !== 'true' },
	plugins: [
		// RFC 8628 device flow: how `sh4 login` gets approved from a browser.
		// verificationUri defaults to /device, which is the page that approves it.
		// `schema: {}` works around a better-auth 1.4.22 bug: its options are validated with a
		// zod schema whose `schema` key is non-optional, so even deviceAuthorization() throws.
		deviceAuthorization({ expiresIn: '10m', interval: '5s', schema: {} }),
		// Lets the CLI present the device-flow access_token on the one call that creates
		// its API key — better-auth otherwise reads sessions from cookies only.
		bearer(),
		// The CLI's durable, per-machine, individually revocable credential.
		// The plugin defaults to 10 requests per 24h, which would brick the CLI almost
		// immediately; keep a limit as a runaway-loop backstop, but a usable one.
		apiKey({
			// Off by default: without it, an `x-api-key` header never resolves to a session,
			// so getSession() in hooks.server.ts would leave every API request unauthenticated.
			enableSessionForAPIKeys: true,
			// ...but that makes a key equivalent to a full admin session, so confine where one
			// is even read. Without this, a leaked CLI key could browse /admin and — worse —
			// POST /api/auth/api-key/create to mint a replacement that survives revoking it.
			// This getter is the plugin's own hook for locating the key, so it also covers
			// better-auth's internal routes, which never see our SvelteKit hook's headers.
			customAPIKeyGetter: (ctx) => {
				const url = ctx.request?.url;
				// A direct server-side getSession() call carries no request object; those come
				// from hooks.server.ts, which strips the header itself on out-of-scope paths.
				if (url && !new URL(url).pathname.startsWith(API_KEY_SCOPE)) return null;
				return ctx.headers?.get('x-api-key') ?? null;
			},
			rateLimit: { enabled: true, timeWindow: 1000 * 60 * 60, maxRequests: 1000 }
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;

export const createAuth = (d1: D1Database) =>
	betterAuth({
		...authConfig,
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
