import { basename, extname } from 'node:path';

// Extensions whose shiki language id isn't just the extension itself.
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
	ts: 'typescript',
	tsx: 'tsx',
	js: 'javascript',
	jsx: 'jsx',
	mjs: 'javascript',
	cjs: 'javascript',
	py: 'python',
	rb: 'ruby',
	rs: 'rust',
	go: 'go',
	sh: 'bash',
	bash: 'bash',
	fish: 'fish',
	zsh: 'bash',
	yml: 'yaml',
	yaml: 'yaml',
	json: 'json',
	jsonc: 'jsonc',
	md: 'markdown',
	html: 'html',
	css: 'css',
	svelte: 'svelte',
	sql: 'sql',
	toml: 'toml',
	c: 'c',
	h: 'c',
	cpp: 'cpp',
	java: 'java',
	kt: 'kotlin',
	swift: 'swift',
	php: 'php'
};

const FENCE = /^\s*(```|~~~)/;
const H1 = /^#\s+(.+?)\s*$/;

const firstH1 = (markdown: string): string | null => {
	let inFence = false;

	for (const line of markdown.split('\n')) {
		if (FENCE.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;

		const match = H1.exec(line);
		if (match) return match[1];
	}

	return null;
};

export const inferTitle = (opts: {
	explicit?: string;
	markdown: string;
	filePath?: string;
}): string => {
	const explicit = opts.explicit?.trim();
	if (explicit) return explicit;

	const heading = firstH1(opts.markdown);
	if (heading) return heading;

	if (opts.filePath) return basename(opts.filePath, extname(opts.filePath));

	return 'Untitled';
};

export const inferLanguage = (opts: { explicit?: string; filePath?: string }): string => {
	const explicit = opts.explicit?.trim();
	if (explicit) return explicit;
	if (!opts.filePath) return 'plaintext';

	const ext = extname(opts.filePath).replace(/^\./, '').toLowerCase();
	if (!ext) return 'plaintext';

	return LANGUAGE_BY_EXTENSION[ext] ?? 'plaintext';
};
