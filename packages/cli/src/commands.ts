import * as p from '@clack/prompts';
import { apiRequest } from './api';
import { inferLanguage, inferTitle } from './infer';
import { readSource } from './input';
import { highlightCode, renderMarkdown } from './render';
import { fail, succeed } from './output';

type CreateResponse = { id: string; alias: string; url: string };

type CommonOpts = { alias?: string; title?: string; force?: boolean; open?: boolean };

// D1 caps a row at 2,000,000 bytes. Shiki output runs ~24x the size of its markdown, so a
// large note reaches that limit long before it looks big: measured, 42KB of markdown renders
// to 1.0MB and stores fine, while 130KB renders to ~3MB and the write fails with an opaque
// 500. Refuse past a margin under the cap so the failure is legible instead of that 500.
export const MAX_ROW_BYTES = 1_900_000;

export const rowBytes = (content: string, contentHtml: string): number =>
	Buffer.byteLength(content, 'utf8') + Buffer.byteLength(contentHtml, 'utf8');

export const isTooLarge = (content: string, contentHtml: string): boolean =>
	rowBytes(content, contentHtml) > MAX_ROW_BYTES;

const checkSize = (content: string, contentHtml: string) => {
	if (!isTooLarge(content, contentHtml)) return;

	const mb = (rowBytes(content, contentHtml) / 1_000_000).toFixed(1);
	fail(
		`Too large to store: ${mb}MB rendered, and D1 caps a row at 2.0MB. ` +
			`Syntax highlighting expands code heavily — split the content, or trim the code blocks.`
	);
};

export const createNote = async (file: string | undefined, opts: CommonOpts) => {
	const { content, filePath } = await readSource(file);
	const contentHtml = await renderMarkdown(content);
	checkSize(content, contentHtml);

	const result = await apiRequest<CreateResponse>('POST', '/api/v1/notes', {
		title: inferTitle({ explicit: opts.title, markdown: content, filePath }),
		alias: opts.alias,
		content,
		contentHtml,
		overwrite: opts.force ?? false
	});

	await succeed(result.url, { open: opts.open ?? false });
};

export const createPaste = async (
	file: string | undefined,
	opts: CommonOpts & { language?: string }
) => {
	const { content, filePath } = await readSource(file);
	const language = inferLanguage({ explicit: opts.language, filePath });
	// An unknown-to-shiki language id throws; fall back rather than losing the paste.
	const contentHtml = await highlightCode(content, language).catch(() =>
		highlightCode(content, 'text')
	);
	checkSize(content, contentHtml);

	const result = await apiRequest<CreateResponse>('POST', '/api/v1/pastes', {
		title: inferTitle({ explicit: opts.title, markdown: '', filePath }),
		alias: opts.alias,
		language,
		content,
		contentHtml,
		overwrite: opts.force ?? false
	});

	await succeed(result.url, { open: opts.open ?? false });
};

export const createLink = async (
	destinationUrl: string,
	opts: { alias?: string; message?: string; open?: boolean; force?: boolean }
) => {
	const result = await apiRequest<CreateResponse>('POST', '/api/v1/links', {
		destinationUrl,
		alias: opts.alias,
		message: opts.message,
		overwrite: opts.force ?? false
	});

	await succeed(result.url, { open: opts.open ?? false });
};

const RESOURCES = {
	n: 'notes',
	note: 'notes',
	notes: 'notes',
	p: 'pastes',
	paste: 'pastes',
	pastes: 'pastes',
	l: 'links',
	link: 'links',
	links: 'links'
} as const;

export type ResourceName = 'notes' | 'pastes' | 'links';

export const resolveResource = (input: string): ResourceName => {
	const resolved = RESOURCES[input as keyof typeof RESOURCES];
	if (!resolved) fail(`Unknown type "${input}". Use notes, pastes, or links (or n, p, l).`);
	return resolved;
};

export type ListItem = {
	id: string;
	alias: string;
	url: string;
	visitCount: number;
	title?: string;
	destinationUrl?: string;
};

export const fetchList = async (resource: ResourceName): Promise<ListItem[]> => {
	const { items } = await apiRequest<{ items: ListItem[] }>('GET', `/api/v1/${resource}`);
	return items;
};

export const list = async (type = 'notes') => {
	const resource = resolveResource(type);
	const items = await fetchList(resource);

	if (items.length === 0) {
		p.log.info(`No ${resource} yet.`);
		return;
	}

	// Plain tab-separated output so this stays pipeable into grep/awk.
	for (const item of items) {
		const label = item.title ?? item.destinationUrl ?? '';
		console.log(`${item.alias}\t${item.visitCount}\t${label}`);
	}
};

export const remove = async (resource: ResourceName, id: string) => {
	await apiRequest<void>('DELETE', `/api/v1/${resource}/${id}`);
};
