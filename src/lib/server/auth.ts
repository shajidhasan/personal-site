import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { apiKey, bearer, deviceAuthorization } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';

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
