// Markdown → HTML pipeline with shiki highlighting.
//
// IMPORTANT: never import this from server routes — shiki is far too heavy for the
// Worker bundle. Content is rendered to HTML at save time (in the admin browser)
// or by the one-time migration script, and stored in D1 alongside the markdown.
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { codeToHtml, type ShikiTransformer } from 'shiki';

const escapeHtml = (unsafe: string): string => {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

const lineNumbersTransformer: ShikiTransformer = {
	name: 'line-numbers',
	line(node, line) {
		node.properties['data-line'] = line;
		node.children.unshift({
			type: 'element',
			tagName: 'span',
			properties: {
				class: 'line-number',
				style:
					'display: inline-block; width: 2rem; margin-right: 1rem; text-align: right; color: #888; user-select: none;'
			},
			children: [
				{
					type: 'text',
					value: line.toString()
				}
			]
		});
	}
};

export const highlightCode = async (code: string, lang: string): Promise<string> =>
	codeToHtml(code, {
		lang,
		themes: {
			dark: 'vitesse-dark',
			light: 'snazzy-light'
		},
		transformers: [lineNumbersTransformer]
	});

export const marked = new Marked().use(
	markedShiki({
		async highlight(code, lang) {
			const html = await highlightCode(code, lang);

			const escapedCode = escapeHtml(code);
			const escapedHtml = escapeHtml(html);

			return `<code-block code="${escapedCode}" html="${escapedHtml}"></code-block>`;
		}
	})
);

export const renderMarkdown = async (markdown: string): Promise<string> => marked.parse(markdown);
