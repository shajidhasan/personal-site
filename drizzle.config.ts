import { defineConfig } from 'drizzle-kit';

// The d1-http credentials are only needed for remote commands (db:push, db:studio).
// `db:generate` works offline; local migrations go through `wrangler d1 migrations apply --local`.
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
		databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? '',
		token: process.env.CLOUDFLARE_D1_TOKEN ?? ''
	},
	verbose: true,
	strict: true
});
