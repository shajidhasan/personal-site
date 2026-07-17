import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const timestamps = () => ({
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
});

export const post = sqliteTable(
	'post',
	{
		id: id(),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		excerpt: text('excerpt').notNull().default(''),
		content: text('content').notNull(),
		contentHtml: text('content_html').notNull(),
		featuredImageUrl: text('featured_image_url'),
		tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
		readTimeMinutes: integer('read_time_minutes').notNull().default(1),
		isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
		publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
		visitCount: integer('visit_count').notNull().default(0),
		...timestamps()
	},
	(table) => [uniqueIndex('post_slug_idx').on(table.slug)]
);

export const note = sqliteTable(
	'note',
	{
		id: id(),
		title: text('title').notNull(),
		alias: text('alias').notNull(),
		content: text('content').notNull(),
		contentHtml: text('content_html').notNull(),
		visitCount: integer('visit_count').notNull().default(0),
		...timestamps()
	},
	(table) => [uniqueIndex('note_alias_idx').on(table.alias)]
);

export const paste = sqliteTable(
	'paste',
	{
		id: id(),
		title: text('title').notNull(),
		alias: text('alias').notNull(),
		language: text('language').notNull().default('plaintext'),
		content: text('content').notNull(),
		contentHtml: text('content_html').notNull(),
		visitCount: integer('visit_count').notNull().default(0),
		...timestamps()
	},
	(table) => [uniqueIndex('paste_alias_idx').on(table.alias)]
);

export const shortLink = sqliteTable(
	'short_link',
	{
		id: id(),
		alias: text('alias').notNull(),
		destinationUrl: text('destination_url').notNull(),
		message: text('message'),
		visitCount: integer('visit_count').notNull().default(0),
		...timestamps()
	},
	(table) => [uniqueIndex('short_link_alias_idx').on(table.alias)]
);

export const project = sqliteTable(
	'project',
	{
		id: id(),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		description: text('description').notNull(),
		url: text('url').notNull(),
		iconUrl: text('icon_url'),
		isWip: integer('is_wip', { mode: 'boolean' }).notNull().default(false),
		sortOrder: integer('sort_order').notNull().default(0),
		...timestamps()
	},
	(table) => [uniqueIndex('project_slug_idx').on(table.slug)]
);

export const researchPaper = sqliteTable('research_paper', {
	id: id(),
	title: text('title').notNull(),
	authors: text('authors', { mode: 'json' }).$type<string[]>().notNull().default([]),
	venue: text('venue'),
	year: integer('year').notNull(),
	abstract: text('abstract'),
	doi: text('doi'),
	url: text('url').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
	isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
	isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
	sortOrder: integer('sort_order').notNull().default(0),
	...timestamps()
});

export const setting = sqliteTable('setting', {
	key: text('key').primaryKey(),
	value: text('value', { mode: 'json' }).notNull(),
	...timestamps()
});

export type Post = typeof post.$inferSelect;
export type Note = typeof note.$inferSelect;
export type Paste = typeof paste.$inferSelect;
export type ShortLink = typeof shortLink.$inferSelect;
export type Project = typeof project.$inferSelect;
export type ResearchPaper = typeof researchPaper.$inferSelect;

export * from './auth.schema';
