/**
 * CodeMirror 6 setup for the admin editors (ported from lumidoc).
 *
 * Browser-only: every `@codemirror/*` / `@lezer/*` import in the project must
 * live in this module — vite.config.ts swaps it for a throwing stub in the
 * server build so CodeMirror never reaches the Worker bundle.
 */
import { EditorView, keymap, placeholder as cmPlaceholder, drawSelection } from '@codemirror/view';
import { EditorState, EditorSelection, Compartment, type Extension } from '@codemirror/state';
import {
	history,
	defaultKeymap,
	historyKeymap,
	indentWithTab,
	undo,
	redo
} from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { HighlightStyle, syntaxHighlighting, LanguageDescription } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export type EditorTheme = 'auto' | 'dark' | 'light';

export interface EditorOptions {
	doc?: string;
	placeholder?: string;
	/** 'auto' follows the html.dark class; the always-dark admin passes 'dark'. */
	theme?: EditorTheme;
	onChange?: (value: string) => void;
}

export interface CodeEditorOptions extends EditorOptions {
	/** Language name matched against @codemirror/language-data (plaintext fallback). */
	language?: string;
}

export interface MarkdownEditorHandle {
	getValue(): string;
	/** Replaces the document without firing onChange. */
	setValue(value: string): void;
	focus(): void;
	destroy(): void;
	actions: {
		bold(): void;
		italic(): void;
		strike(): void;
		h1(): void;
		h2(): void;
		h3(): void;
		bulletList(): void;
		orderedList(): void;
		quote(): void;
		link(): void;
		imageSnippet(): void;
		inlineCode(): void;
		codeBlock(): void;
		undo(): void;
		redo(): void;
		/** Inserts text at the cursor (used for upload placeholders). */
		insertAtCursor(text: string): void;
		/** Replaces the first occurrence of `search` ('' removes it). */
		replaceOnce(search: string, replacement: string): void;
	};
}

export interface CodeEditorHandle {
	getValue(): string;
	setValue(value: string): void;
	setLanguage(language: string): void;
	focus(): void;
	destroy(): void;
}

const isDark = (theme: EditorTheme): boolean => {
	if (theme === 'dark') return true;
	if (theme === 'light') return false;
	return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
};

const buildTheme = (dark: boolean) => {
	const editorTheme = EditorView.theme(
		{
			'&': {
				flex: '1',
				minHeight: '0',
				height: '100%',
				fontSize: '0.875rem',
				lineHeight: '1.7',
				fontFamily:
					'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
				background: 'transparent',
				color: dark ? '#a1a1aa' : '#3f3f46'
			},
			'&.cm-focused': {
				outline: 'none'
			},
			'.cm-content': {
				caretColor: dark ? '#fafafa' : '#18181b',
				padding: '1rem 1.25rem',
				minHeight: '100%'
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeftColor: dark ? '#fafafa' : '#18181b',
				borderLeftWidth: '2px'
			},
			'.cm-selectionBackground': {
				background: dark ? 'rgba(244,63,94,0.22)' : 'rgba(244,63,94,0.13)'
			},
			'&.cm-focused .cm-selectionBackground': {
				background: dark ? 'rgba(244,63,94,0.3) !important' : 'rgba(244,63,94,0.18) !important'
			},
			'.cm-activeLine': {
				background: dark ? 'rgba(39,39,42,0.35)' : 'rgba(244,244,245,0.55)'
			},
			'.cm-gutters': {
				display: 'none'
			},
			'.cm-scroller': {
				overflow: 'auto',
				fontFamily: 'inherit'
			},
			'.cm-placeholder': {
				color: dark ? '#52525b' : '#a1a1aa',
				fontStyle: 'italic'
			},
			'.cm-fencedCode': {
				background: dark ? 'rgba(39,39,42,0.5)' : 'rgba(244,244,245,0.7)',
				borderRadius: '0.25rem',
				padding: '0.125rem 0.25rem'
			},
			'.cm-searchMatch': {
				background: dark ? 'rgba(250,204,21,0.25)' : 'rgba(250,204,21,0.4)',
				outline: '1px solid rgba(250,204,21,0.5)'
			},
			'.cm-searchMatch.cm-searchMatch-selected': {
				background: dark ? 'rgba(250,204,21,0.4)' : 'rgba(250,204,21,0.6)'
			}
		},
		{ dark }
	);

	const highlightStyle = HighlightStyle.define([
		{
			tag: tags.heading1,
			color: dark ? '#f4f4f5' : '#18181b',
			fontWeight: '700',
			fontSize: '1.125em'
		},
		{
			tag: tags.heading2,
			color: dark ? '#e4e4e7' : '#27272a',
			fontWeight: '600',
			fontSize: '1.0625em'
		},
		{ tag: tags.heading3, color: dark ? '#d4d4d8' : '#3f3f46', fontWeight: '600' },
		{ tag: tags.strong, color: dark ? '#f4f4f5' : '#18181b', fontWeight: '700' },
		{ tag: tags.emphasis, color: dark ? '#e4e4e7' : '#27272a', fontStyle: 'italic' },
		{ tag: tags.strikethrough, color: '#71717a', textDecoration: 'line-through' },
		{
			tag: tags.monospace,
			color: dark ? '#c084fc' : '#7c3aed',
			background: dark ? 'rgba(39,39,42,0.6)' : 'rgba(244,244,245,0.8)',
			borderRadius: '0.2em',
			padding: '0.05em 0.3em'
		},
		{ tag: tags.link, color: dark ? '#818cf8' : '#4f46e5', textDecoration: 'underline' },
		{ tag: tags.url, color: dark ? '#6366f1' : '#4338ca' },
		{ tag: tags.quote, color: '#71717a', fontStyle: 'italic' },
		{ tag: tags.processingInstruction, color: dark ? '#52525b' : '#a1a1aa' },
		{ tag: tags.contentSeparator, color: dark ? '#52525b' : '#a1a1aa' },
		{ tag: tags.comment, color: dark ? '#52525b' : '#a1a1aa', fontStyle: 'italic' },
		{ tag: tags.labelName, color: dark ? '#94a3b8' : '#64748b', fontWeight: '600' },
		{ tag: tags.atom, color: dark ? '#c084fc' : '#7c3aed' },
		{ tag: tags.keyword, color: dark ? '#93c5fd' : '#1d4ed8' },
		{ tag: tags.string, color: dark ? '#86efac' : '#15803d' },
		{ tag: tags.number, color: dark ? '#fdba74' : '#c2410c' },
		{ tag: tags.bool, color: dark ? '#f9a8d4' : '#be185d' },
		{ tag: tags.variableName, color: dark ? '#67e8f9' : '#0e7490' },
		{ tag: tags.function(tags.variableName), color: dark ? '#93c5fd' : '#1d4ed8' },
		{ tag: tags.typeName, color: dark ? '#f9a8d4' : '#9d174d' },
		{ tag: tags.className, color: dark ? '#fde68a' : '#b45309' },
		{ tag: tags.operator, color: dark ? '#94a3b8' : '#475569' },
		{ tag: tags.punctuation, color: '#71717a' },
		{ tag: tags.bracket, color: dark ? '#94a3b8' : '#64748b' },
		{ tag: tags.meta, color: dark ? '#71717a' : '#a1a1aa' }
	]);

	return [editorTheme, syntaxHighlighting(highlightStyle)];
};

interface BaseEditor {
	view: EditorView;
	setValue(value: string): void;
	destroy(): void;
}

const createBaseEditor = (
	parent: HTMLElement,
	options: EditorOptions,
	extraExtensions: Extension[]
): BaseEditor => {
	const theme: EditorTheme = options.theme ?? 'auto';
	const themeCompartment = new Compartment();
	let settingFromOutside = false;

	const state = EditorState.create({
		doc: options.doc ?? '',
		extensions: [
			history(),
			keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
			cmPlaceholder(options.placeholder ?? 'Start writing...'),
			EditorView.lineWrapping,
			drawSelection(),
			themeCompartment.of(buildTheme(isDark(theme))),
			EditorView.updateListener.of((update) => {
				if (update.docChanged && !settingFromOutside) {
					options.onChange?.(update.state.doc.toString());
				}
			}),
			...extraExtensions
		]
	});

	const view = new EditorView({ state, parent });

	let observer: MutationObserver | null = null;
	if (theme === 'auto' && typeof document !== 'undefined') {
		observer = new MutationObserver(() => {
			view.dispatch({ effects: themeCompartment.reconfigure(buildTheme(isDark(theme))) });
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	}

	return {
		view,
		setValue(value: string) {
			if (value === view.state.doc.toString()) return;
			settingFromOutside = true;
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
			settingFromOutside = false;
		},
		destroy() {
			observer?.disconnect();
			view.destroy();
		}
	};
};

export const createMarkdownEditor = (
	parent: HTMLElement,
	options: EditorOptions = {}
): MarkdownEditorHandle => {
	const base = createBaseEditor(parent, options, [markdown({ codeLanguages: languages })]);
	const { view } = base;

	const wrapSelection = (before: string, after = before) => {
		view.dispatch(
			view.state.changeByRange((range) => {
				const selected = view.state.sliceDoc(range.from, range.to);
				const insert = before + selected + after;
				return {
					changes: { from: range.from, to: range.to, insert },
					range: EditorSelection.cursor(range.from + insert.length - after.length)
				};
			})
		);
		view.focus();
	};

	const prefixLine = (prefix: string) => {
		view.dispatch(
			view.state.changeByRange((range) => {
				const line = view.state.doc.lineAt(range.from);
				if (line.text.startsWith(prefix)) {
					return {
						changes: { from: line.from, to: line.from + prefix.length, insert: '' },
						range: EditorSelection.cursor(Math.max(line.from, range.from - prefix.length))
					};
				}
				return {
					changes: { from: line.from, insert: prefix },
					range: EditorSelection.cursor(range.from + prefix.length)
				};
			})
		);
		view.focus();
	};

	return {
		getValue: () => view.state.doc.toString(),
		setValue: base.setValue,
		focus: () => view.focus(),
		destroy: base.destroy,
		actions: {
			bold: () => wrapSelection('**'),
			italic: () => wrapSelection('*'),
			strike: () => wrapSelection('~~'),
			h1: () => prefixLine('# '),
			h2: () => prefixLine('## '),
			h3: () => prefixLine('### '),
			bulletList: () => prefixLine('- '),
			orderedList: () => prefixLine('1. '),
			quote: () => prefixLine('> '),
			inlineCode: () => wrapSelection('`'),
			link: () => {
				view.dispatch(
					view.state.changeByRange((range) => {
						const selected = view.state.sliceDoc(range.from, range.to);
						const text = selected || 'link text';
						const insert = `[${text}](url)`;
						const urlStart = range.from + text.length + 3;
						return {
							changes: { from: range.from, to: range.to, insert },
							range: EditorSelection.range(urlStart, urlStart + 3)
						};
					})
				);
				view.focus();
			},
			imageSnippet: () => {
				view.dispatch(
					view.state.changeByRange((range) => {
						const selected = view.state.sliceDoc(range.from, range.to);
						const alt = selected || 'alt text';
						const insert = `![${alt}](url)`;
						const urlStart = range.from + alt.length + 4;
						return {
							changes: { from: range.from, to: range.to, insert },
							range: EditorSelection.range(urlStart, urlStart + 3)
						};
					})
				);
				view.focus();
			},
			codeBlock: () => {
				view.dispatch(
					view.state.changeByRange((range) => {
						const selected = view.state.sliceDoc(range.from, range.to);
						const insert = '```\n' + selected + '\n```';
						const anchor = range.from + 4;
						return {
							changes: { from: range.from, to: range.to, insert },
							range: EditorSelection.range(anchor, anchor + selected.length)
						};
					})
				);
				view.focus();
			},
			undo: () => {
				undo(view);
				view.focus();
			},
			redo: () => {
				redo(view);
				view.focus();
			},
			insertAtCursor: (text: string) => {
				const cursor = view.state.selection.main;
				view.dispatch({
					changes: { from: cursor.from, to: cursor.to, insert: text },
					selection: EditorSelection.cursor(cursor.from + text.length)
				});
			},
			replaceOnce: (search: string, replacement: string) => {
				const index = view.state.doc.toString().indexOf(search);
				if (index !== -1) {
					view.dispatch({
						changes: { from: index, to: index + search.length, insert: replacement }
					});
				}
			}
		}
	};
};

export const createCodeEditor = (
	parent: HTMLElement,
	options: CodeEditorOptions = {}
): CodeEditorHandle => {
	const languageCompartment = new Compartment();
	const base = createBaseEditor(parent, options, [languageCompartment.of([])]);
	const { view } = base;

	let generation = 0;
	const setLanguage = (name: string) => {
		const current = ++generation;
		const description = name ? LanguageDescription.matchLanguageName(languages, name, true) : null;
		if (!description) {
			view.dispatch({ effects: languageCompartment.reconfigure([]) });
			return;
		}
		description.load().then((support) => {
			// A newer setLanguage call wins; drop stale loads
			if (current !== generation) return;
			view.dispatch({ effects: languageCompartment.reconfigure(support) });
		});
	};
	if (options.language) setLanguage(options.language);

	return {
		getValue: () => view.state.doc.toString(),
		setValue: base.setValue,
		setLanguage,
		focus: () => view.focus(),
		destroy: base.destroy
	};
};
