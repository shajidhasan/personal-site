# sh4jid.me

My personal site and its admin panel, one SvelteKit app on Cloudflare Workers. It fits comfortably in Cloudflare's free tier, so the only thing it costs me is the domain. If you have one of those, you can fork this repo and have your own version up in about fifteen minutes.

## Features

- Blog with markdown, code highlighting (shiki), and KaTeX for math
- Comments on posts via [giscus](https://giscus.app)
- Pages for projects and research publications; the research page appears only when it has entries
- URL shortener (`/l/hi`), shareable notes (`/n/hello`), and a pastebin (`/p/snippet`)
- Admin panel at `/admin` where you write and manage everything: posts, projects, images, short links, site settings
- Image uploads stored in R2, served from `/images/<key>`
- RSS feed and sitemap
- Dark mode
- Single admin account through better-auth; public signup is disabled

## How it works

SvelteKit 2 + Svelte 5, Tailwind 4. Content lives in D1 (queried with Drizzle), images in R2. Markdown is rendered to HTML in your browser when you save a post, so the Worker never has to bundle shiki. The admin editors are CodeMirror 6, kept out of the Worker the same way (see the SSR stubs in `vite.config.ts`).

Your name, bio, social links, and SEO meta are rows in the `setting` table, edited at `/admin/settings`. The defaults in `src/lib/server/settings.ts` get deep-merged under whatever you save there, so they double as the seed and there is no settings migration to run.

## Run it locally

```sh
pnpm install
pnpm db:apply:local   # apply migrations to the local (miniflare) D1
pnpm dev
```

The dev server emulates D1 and R2 automatically. Local state goes in `.wrangler/state/`, completely separate from production.

To create your local admin account: copy `.env.example` to `.env`, set `ALLOW_SIGNUP="true"`, then

```sh
curl -X POST http://localhost:5173/api/auth/sign-up/email \
  -H 'content-type: application/json' \
  -d '{"name":"Your Name","email":"you@example.com","password":"..."}'
```

and remove `ALLOW_SIGNUP` again. With the flag unset, signup stays disabled.

## Deploy your own

You need a Cloudflare account (free) and a domain with its DNS on Cloudflare.

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create personal-site-db
pnpm exec wrangler r2 bucket create personal-site-images
```

`d1 create` prints a `database_id`. Put it in `wrangler.jsonc`, change `routes` to your domain, and set `vars.ORIGIN` to match:

```jsonc
"routes": [
    { "pattern": "example.com", "custom_domain": true },
    { "pattern": "www.example.com", "custom_domain": true }
],
"vars": { "ORIGIN": "https://example.com" }
```

Then:

```sh
pnpm gen                                           # regenerate types after wrangler.jsonc changes
pnpm exec wrangler secret put BETTER_AUTH_SECRET   # paste output of: openssl rand -base64 32
pnpm db:apply:remote                               # run migrations against production D1
pnpm build && pnpm exec wrangler deploy
```

Create the production admin account the same way as locally: temporarily set `ALLOW_SIGNUP` (with `wrangler versions secret put`), sign up once, remove it. Or copy your local `user` and `account` rows into remote D1; the password hash is portable.

## Make it yours

Most personal details are editable at `/admin/settings` once you're deployed. A few things are in the code:

- `src/lib/server/settings.ts` — the default name, bio, social links, and SEO text. Change these first.
- `src/lib/components/blog/Giscus.svelte` — giscus repo and category IDs. Get yours from [giscus.app](https://giscus.app), or delete the component if you don't want comments.
- `src/hooks.server.ts`, `src/routes/rss.xml/+server.ts`, `src/routes/sitemap.xml/+server.ts`, `src/routes/(public)/blog/[slug]/+page.server.ts` — hardcoded `sh4jid.me` URLs. Search the repo for `sh4jid` to catch the fallback strings in the Navbar, Footer, and BlogPost components too.
- `static/` — favicons, `og-image.jpg`, `site.webmanifest`, `robots.txt`.
- `src/lib/assets/sh4jid.jpg` — the avatar on the home page.

## Schema changes

1. Edit `src/lib/server/db/schema.ts`
2. `pnpm db:generate` writes a migration to `drizzle/`
3. `pnpm db:apply:local` to apply it locally, `pnpm db:apply:remote` for production

If you change the better-auth config, run `pnpm auth:schema` before `db:generate`. Note that `db:push` and `db:studio` talk to the remote database only and need the `CLOUDFLARE_*` vars from `.env.example`.
