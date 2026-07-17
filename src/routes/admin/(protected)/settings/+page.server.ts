import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getSettings, putSetting } from '$lib/server/settings';
import type { SocialLink, SocialPlatform } from '$lib/types';

const PLATFORMS: SocialPlatform[] = ['github', 'x', 'linkedin', 'email', 'scholar', 'orcid'];

const str = (formData: FormData, name: string) => {
	const value = formData.get(name);
	return typeof value === 'string' ? value.trim() : '';
};

export const load = async ({ platform }) => {
	const settings = await getSettings(getDb(platform!.env.DB));
	return { settings };
};

export const actions = {
	identity: async ({ request, platform }) => {
		const formData = await request.formData();
		const fullName = str(formData, 'fullName');
		const shortName = str(formData, 'shortName');
		const headline = str(formData, 'headline');

		const errors: Record<string, string> = {};
		if (!fullName) errors.fullName = 'Full name is required.';
		if (!shortName) errors.shortName = 'Short name is required.';
		if (!headline) errors.headline = 'Headline is required.';
		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		try {
			await putSetting(getDb(platform!.env.DB), 'identity', {
				fullName,
				shortName,
				headline,
				avatarUrl: str(formData, 'avatarUrl') || null
			});
		} catch {
			return fail(500, { message: 'Failed to save identity.' });
		}
		return {};
	},

	bio: async ({ request, platform }) => {
		const formData = await request.formData();
		const markdown =
			typeof formData.get('markdown') === 'string' ? (formData.get('markdown') as string) : '';
		const html = typeof formData.get('html') === 'string' ? (formData.get('html') as string) : '';

		if (!markdown.trim()) return fail(400, { message: 'Bio cannot be empty.' });
		if (!html.trim())
			return fail(400, { message: 'Rendered bio is missing. Please try saving again.' });

		try {
			await putSetting(getDb(platform!.env.DB), 'bio', { markdown, html });
		} catch {
			return fail(500, { message: 'Failed to save bio.' });
		}
		return {};
	},

	social: async ({ request, platform }) => {
		const formData = await request.formData();
		let parsed: unknown;
		try {
			parsed = JSON.parse(str(formData, 'links') || '[]');
		} catch {
			return fail(400, { message: 'Invalid social links payload.' });
		}
		if (!Array.isArray(parsed)) return fail(400, { message: 'Invalid social links payload.' });

		const links: SocialLink[] = [];
		for (const item of parsed) {
			const platformName = item?.platform as SocialPlatform;
			const url = typeof item?.url === 'string' ? item.url.trim() : '';
			if (!PLATFORMS.includes(platformName)) {
				return fail(400, { message: `Unknown platform: ${String(item?.platform)}` });
			}
			if (!url || (!/^https?:\/\//.test(url) && !url.startsWith('mailto:'))) {
				return fail(400, { message: `Each link needs an http(s) or mailto: URL.` });
			}
			links.push({ platform: platformName, url });
		}

		try {
			await putSetting(getDb(platform!.env.DB), 'socialLinks', links);
		} catch {
			return fail(500, { message: 'Failed to save social links.' });
		}
		return {};
	},

	seo: async ({ request, platform }) => {
		const formData = await request.formData();
		const siteName = str(formData, 'siteName');
		const siteTitle = str(formData, 'siteTitle');
		const siteDescription = str(formData, 'siteDescription');
		const ogImageUrl = str(formData, 'ogImageUrl');

		const errors: Record<string, string> = {};
		if (!siteName) errors.siteName = 'Site name is required.';
		if (!siteTitle) errors.siteTitle = 'Site title is required.';
		if (!siteDescription) errors.siteDescription = 'Site description is required.';
		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		const pages = {} as Record<
			'home' | 'blog' | 'projects' | 'research',
			{ title: string; description: string }
		>;
		for (const page of ['home', 'blog', 'projects', 'research'] as const) {
			const title = str(formData, `${page}Title`);
			const description = str(formData, `${page}Description`);
			if (!title || !description) {
				return fail(400, {
					message: `Both title and description are required for the ${page} page.`
				});
			}
			pages[page] = { title, description };
		}

		try {
			await putSetting(getDb(platform!.env.DB), 'seo', {
				siteName,
				siteTitle,
				siteDescription,
				ogImageUrl,
				pages
			});
		} catch {
			return fail(500, { message: 'Failed to save SEO settings.' });
		}
		return {};
	}
};
