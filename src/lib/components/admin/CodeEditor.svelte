<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeEditor, type CodeEditorHandle } from '$lib/editor/codemirror';

	interface Props {
		value?: string;
		language?: string;
		placeholder?: string;
		minHeight?: string;
	}

	let {
		value = $bindable(''),
		language = '',
		placeholder = 'Paste code...',
		minHeight = '16rem'
	}: Props = $props();

	let container: HTMLDivElement;
	let editor: CodeEditorHandle | null = null;

	onMount(() => {
		editor = createCodeEditor(container, {
			doc: value,
			language,
			placeholder,
			theme: 'dark',
			onChange: (v) => (value = v)
		});
		return () => editor?.destroy();
	});

	$effect(() => {
		editor?.setValue(value);
	});

	$effect(() => {
		editor?.setLanguage(language);
	});
</script>

<div
	bind:this={container}
	class="cm-host overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 focus-within:border-rose-500/60"
	style="min-height: {minHeight};"
></div>

<style>
	.cm-host {
		display: flex;
		flex-direction: column;
	}

	.cm-host :global(.cm-editor) {
		flex: 1;
		min-height: 0;
		height: 100%;
	}

	.cm-host :global(.cm-scroller) {
		overflow-y: auto;
		flex: 1;
	}

	.cm-host :global(.cm-scroller::-webkit-scrollbar) {
		width: 5px;
	}
	.cm-host :global(.cm-scroller::-webkit-scrollbar-thumb) {
		background: #3f3f46;
		border-radius: 3px;
	}
</style>
