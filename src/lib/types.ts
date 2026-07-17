// Plain mirrors of the Drizzle tables in $lib/server/db/schema.ts —
// components can't import server-only modules, so these live here.
export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	contentHtml: string;
	featuredImageUrl: string | null;
	tags: string[];
	readTimeMinutes: number;
	isPublished: boolean;
	publishedAt: Date | null;
	visitCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Note {
	id: string;
	title: string;
	alias: string;
	content: string;
	contentHtml: string;
	visitCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Paste {
	id: string;
	title: string;
	alias: string;
	language: string;
	content: string;
	contentHtml: string;
	visitCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ShortLink {
	id: string;
	alias: string;
	destinationUrl: string;
	message: string | null;
	visitCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Project {
	id: string;
	title: string;
	slug: string;
	description: string;
	url: string;
	iconUrl: string | null;
	isWip: boolean;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ResearchPaper {
	id: string;
	title: string;
	authors: string[];
	venue: string | null;
	year: number;
	abstract: string | null;
	doi: string | null;
	url: string;
	tags: string[];
	isPublished: boolean;
	isFeatured: boolean;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
}

export type SocialPlatform = 'github' | 'x' | 'linkedin' | 'email' | 'scholar' | 'orcid';

export interface SocialLink {
	platform: SocialPlatform;
	url: string;
	label?: string;
}

export interface PageSeo {
	title: string;
	description: string;
}

export interface SiteSettings {
	identity: {
		fullName: string;
		shortName: string;
		headline: string;
		avatarUrl: string | null;
	};
	bio: {
		markdown: string;
		html: string;
	};
	socialLinks: SocialLink[];
	seo: {
		siteName: string;
		siteTitle: string;
		siteDescription: string;
		ogImageUrl: string;
		pages: Record<'home' | 'blog' | 'projects' | 'research', PageSeo>;
	};
}
