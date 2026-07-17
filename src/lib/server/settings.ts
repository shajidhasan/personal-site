import { setting } from '$lib/server/db/schema';
import type { getDb } from '$lib/server/db';
import type { SiteSettings } from '$lib/types';

type Db = ReturnType<typeof getDb>;

/**
 * Site settings live in the `setting` KV table, one JSON row per section
 * (identity / bio / socialLinks / seo). These code defaults double as the
 * seed: rows only exist once a section is saved in the admin, and stored
 * values are deep-merged over the defaults — so deploys can add new fields
 * without any migration or seeding step.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
	identity: {
		fullName: 'Shajid Hasan Naim',
		shortName: 'sh4jid',
		headline: 'shajid hasan naim',
		avatarUrl: null
	},
	bio: {
		markdown: `I'm a mechanical engineering undergrad with a love for computer science. I enjoy building things, whether mechanical or digital, and I'm especially drawn to web development and the creative side of tech.

I'm also into entrepreneurship, solving real-world problems and turning ideas into products. In fact, you might know me from [projects](/projects) I've built, sometimes on my own and sometimes with friends.

I like writing about what I learn, from programming tips to random philosophical thoughts, or anything in between! So, this website naturally serves as [my blog](/blog).

Outside of tech, I'm into fantasy books, video games, fighter jets, and superheroes. I practice card magic, fold origami to unwind, and play chess whenever I can.`,
		html: `<p>I'm a mechanical engineering undergrad with a love for computer science. I enjoy building things, whether mechanical or digital, and I'm especially drawn to web development and the creative side of tech.</p>
<p>I'm also into entrepreneurship, solving real-world problems and turning ideas into products. In fact, you might know me from <a class="link" href="/projects">projects</a> I've built, sometimes on my own and sometimes with friends.</p>
<p>I like writing about what I learn, from programming tips to random philosophical thoughts, or anything in between! So, this website naturally serves as <a class="link" href="/blog">my blog</a>.</p>
<p>Outside of tech, I'm into fantasy books, video games, fighter jets, and superheroes. I practice card magic, fold origami to unwind, and play chess whenever I can.</p>`
	},
	socialLinks: [
		{ platform: 'github', url: 'https://github.com/shajidhasan/' },
		{ platform: 'x', url: 'https://x.com/sh4jid' },
		{ platform: 'linkedin', url: 'https://www.linkedin.com/in/sh4jid/' }
	],
	seo: {
		siteName: 'sh4jid.me',
		siteTitle: 'Shajid Hasan Naim',
		siteDescription:
			'Fullstack dev & mechanical engineering student sharing projects, programming tips, and ideas, mixing tech, creativity, and curiosity.',
		ogImageUrl: 'https://sh4jid.me/og-image.jpg',
		pages: {
			home: {
				title: 'Shajid Hasan Naim',
				description:
					'Fullstack dev & mechanical engineering student sharing projects, programming tips, and ideas, mixing tech, creativity, and curiosity.'
			},
			blog: {
				title: 'Blog - Shajid Hasan Naim',
				description:
					'Read blog posts by Shajid Hasan Naim on web development, engineering, creativity, and the ideas behind the projects.'
			},
			projects: {
				title: 'Projects - Shajid Hasan Naim',
				description: 'A collection of personal and collaborative projects by Shajid Hasan Naim.'
			},
			research: {
				title: 'Research - Shajid Hasan Naim',
				description: 'Research publications by Shajid Hasan Naim.'
			}
		}
	}
};

export const getSettings = async (db: Db): Promise<SiteSettings> => {
	const rows = await db.select().from(setting);
	const stored = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Partial<{
		[K in keyof SiteSettings]: SiteSettings[K];
	}>;

	return {
		identity: { ...DEFAULT_SETTINGS.identity, ...stored.identity },
		bio: { ...DEFAULT_SETTINGS.bio, ...stored.bio },
		socialLinks: stored.socialLinks ?? DEFAULT_SETTINGS.socialLinks,
		seo: {
			...DEFAULT_SETTINGS.seo,
			...stored.seo,
			pages: { ...DEFAULT_SETTINGS.seo.pages, ...stored.seo?.pages }
		}
	};
};

export const putSetting = <K extends keyof SiteSettings>(db: Db, key: K, value: SiteSettings[K]) =>
	db
		.insert(setting)
		.values({ key, value })
		.onConflictDoUpdate({ target: setting.key, set: { value, updatedAt: new Date() } });
