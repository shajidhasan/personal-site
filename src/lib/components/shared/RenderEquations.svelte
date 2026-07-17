<script lang="ts">
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	const { text } = $props();

	const stripHtmlTags = (str: string): string => {
		return str.replace(/<[^>]*>/g, '');
	};

	const renderEquations = (text: string): string => {
		const dollarBlockRegex = /\$\$([\s\S]*?)\$\$/g;
		const dollarInlineRegex = /\$([^$\n]+?)\$/g;
		const latexBlockRegex = /\\\[([\s\S]*?)\\\]/g;
		const latexInlineRegex = /\\\(([\s\S]*?)\\\)/g;

		let html = text;

		html = html.replace(latexBlockRegex, (match, equation) => {
			try {
				const cleanEquation = stripHtmlTags(equation.trim());
				return katex.renderToString(cleanEquation, { displayMode: true, strict: false });
			} catch (error) {
				console.error('LaTeX block equation error:', error);
				return match;
			}
		});

		html = html.replace(dollarBlockRegex, (match, equation) => {
			try {
				const cleanEquation = stripHtmlTags(equation.trim());
				return katex.renderToString(cleanEquation, { displayMode: true, strict: false });
			} catch (error) {
				console.error('Dollar block equation error:', error);
				return match;
			}
		});
		html = html.replace(latexInlineRegex, (match, equation) => {
			try {
				const cleanEquation = stripHtmlTags(equation.trim());
				return katex.renderToString(cleanEquation, { displayMode: false, strict: false });
			} catch (error) {
				console.error('LaTeX inline equation error:', error);
				return match;
			}
		});

		html = html.replace(dollarInlineRegex, (match, equation) => {
			try {
				const cleanEquation = stripHtmlTags(equation.trim());
				return katex.renderToString(cleanEquation, { displayMode: false, strict: false });
			} catch (error) {
				console.error('Dollar inline equation error:', error);
				return match;
			}
		});

		return html;
	};

	// eslint-disable-next-line svelte/prefer-writable-derived -- $effect keeps KaTeX rendering client-side only; a $derived would also run during SSR and change the served HTML
	let html = $state('');

	$effect(() => {
		html = renderEquations(text);
	});
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- KaTeX output rendered from trusted admin-authored content -->
{@html html}
