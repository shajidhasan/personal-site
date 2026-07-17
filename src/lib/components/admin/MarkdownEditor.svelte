<script lang="ts">
	import { onMount } from 'svelte';
	import { createMarkdownEditor, type MarkdownEditorHandle } from '$lib/editor/codemirror';
	import { toaster } from '$lib/services/toaster.svelte';

	import BoldIcon from '@lucide/svelte/icons/bold';
	import ItalicIcon from '@lucide/svelte/icons/italic';
	import StrikethroughIcon from '@lucide/svelte/icons/strikethrough';
	import Heading1Icon from '@lucide/svelte/icons/heading-1';
	import Heading2Icon from '@lucide/svelte/icons/heading-2';
	import Heading3Icon from '@lucide/svelte/icons/heading-3';
	import ListIcon from '@lucide/svelte/icons/list';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ImageIcon from '@lucide/svelte/icons/image';
	import CodeIcon from '@lucide/svelte/icons/code';
	import FileCodeIcon from '@lucide/svelte/icons/file-code';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import Redo2Icon from '@lucide/svelte/icons/redo-2';
	import UploadIcon from '@lucide/svelte/icons/upload';

	interface Props {
		value?: string;
		placeholder?: string;
		/** CSS min-height of the editing area (fixed up front so the mount doesn't shift layout). */
		minHeight?: string;
		/** When provided, enables image upload via toolbar button, drag-drop, and paste. */
		onUploadImage?: (file: File) => Promise<{ url: string }>;
	}

	let {
		value = $bindable(''),
		placeholder = 'Write markdown...',
		minHeight = '20rem',
		onUploadImage
	}: Props = $props();

	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

	let container: HTMLDivElement;
	let fileInput: HTMLInputElement | null = $state(null);
	let editor: MarkdownEditorHandle | null = null;
	let isDragOver = $state(false);
	let uploading = $state(false);

	onMount(() => {
		editor = createMarkdownEditor(container, {
			doc: value,
			placeholder,
			theme: 'dark',
			onChange: (v) => (value = v)
		});
		return () => editor?.destroy();
	});

	// Sync external value changes into the editor (guarded inside setValue)
	$effect(() => {
		editor?.setValue(value);
	});

	async function uploadAndInsertImage(file: File) {
		if (!onUploadImage || !editor) return;
		if (!ALLOWED_TYPES.includes(file.type)) {
			toaster.error('Unsupported image type.');
			return;
		}

		const altText = file.name.replace(/\.[^.]+$/, '') || 'image';
		const placeholderText = `![${altText}](uploading-${crypto.randomUUID()})`;
		editor.actions.insertAtCursor(placeholderText);

		uploading = true;
		try {
			const { url } = await onUploadImage(file);
			editor.actions.replaceOnce(placeholderText, `![${altText}](${url})`);
		} catch (e) {
			editor.actions.replaceOnce(placeholderText, '');
			toaster.error(e instanceof Error ? e.message : 'Image upload failed.');
		} finally {
			uploading = false;
			editor.focus();
		}
	}

	function onImageButtonClick() {
		if (onUploadImage) {
			fileInput?.click();
		} else {
			editor?.actions.imageSnippet();
		}
	}

	function onFileInputChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) uploadAndInsertImage(file);
		input.value = '';
	}

	function onEditorDragOver(e: DragEvent) {
		if (!onUploadImage) return;
		const hasImage = Array.from(e.dataTransfer?.items ?? []).some(
			(item) => item.kind === 'file' && item.type.startsWith('image/')
		);
		if (!hasImage) return;
		e.preventDefault();
		isDragOver = true;
	}

	function onEditorDrop(e: DragEvent) {
		if (!onUploadImage) return;
		e.preventDefault();
		isDragOver = false;
		const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith('image/'));
		if (file) uploadAndInsertImage(file);
	}

	function onEditorPaste(e: ClipboardEvent) {
		if (!onUploadImage) return;
		const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
		if (!file) return;
		e.preventDefault();
		uploadAndInsertImage(file);
	}

	const toolbarGroups = $derived([
		[
			{ title: 'Bold', Icon: BoldIcon, action: () => editor?.actions.bold() },
			{ title: 'Italic', Icon: ItalicIcon, action: () => editor?.actions.italic() },
			{ title: 'Strikethrough', Icon: StrikethroughIcon, action: () => editor?.actions.strike() }
		],
		[
			{ title: 'Heading 1', Icon: Heading1Icon, action: () => editor?.actions.h1() },
			{ title: 'Heading 2', Icon: Heading2Icon, action: () => editor?.actions.h2() },
			{ title: 'Heading 3', Icon: Heading3Icon, action: () => editor?.actions.h3() }
		],
		[
			{ title: 'Bulleted list', Icon: ListIcon, action: () => editor?.actions.bulletList() },
			{
				title: 'Numbered list',
				Icon: ListOrderedIcon,
				action: () => editor?.actions.orderedList()
			},
			{ title: 'Blockquote', Icon: QuoteIcon, action: () => editor?.actions.quote() }
		],
		[
			{ title: 'Inline code', Icon: CodeIcon, action: () => editor?.actions.inlineCode() },
			{ title: 'Code block', Icon: FileCodeIcon, action: () => editor?.actions.codeBlock() }
		],
		[
			{ title: 'Undo', Icon: Undo2Icon, action: () => editor?.actions.undo() },
			{ title: 'Redo', Icon: Redo2Icon, action: () => editor?.actions.redo() }
		]
	]);
</script>

{#if onUploadImage}
	<input
		bind:this={fileInput}
		type="file"
		accept={ALLOWED_TYPES.join(',')}
		class="sr-only"
		onchange={onFileInputChange}
	/>
{/if}

<div
	class="flex flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 focus-within:border-rose-500/60"
	role="region"
	aria-label="Markdown editor"
	ondragover={onEditorDragOver}
	ondragleave={() => (isDragOver = false)}
	ondrop={onEditorDrop}
	onpaste={onEditorPaste}
>
	<div
		class="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-zinc-700/70 bg-zinc-800/60 px-2 py-1.5"
	>
		{#each toolbarGroups as group, index (index)}
			{#if index > 0}
				<div class="mx-0.5 h-4 w-px shrink-0 bg-zinc-700"></div>
			{/if}
			{#each group as { title, Icon, action } (title)}
				<button type="button" class="editor-toolbar-btn" {title} onclick={action}>
					<Icon size={15} />
				</button>
			{/each}
			{#if index === 2}
				<div class="mx-0.5 h-4 w-px shrink-0 bg-zinc-700"></div>
				<button
					type="button"
					class="editor-toolbar-btn"
					title="Insert link"
					onclick={() => editor?.actions.link()}
				>
					<LinkIcon size={15} />
				</button>
				<button
					type="button"
					class="editor-toolbar-btn"
					title={onUploadImage ? 'Upload image' : 'Insert image'}
					disabled={uploading}
					onclick={onImageButtonClick}
				>
					{#if uploading}
						<UploadIcon size={15} class="animate-pulse" />
					{:else}
						<ImageIcon size={15} />
					{/if}
				</button>
			{/if}
		{/each}
	</div>

	<div
		bind:this={container}
		class="cm-host {isDragOver ? 'drag-over' : ''}"
		style="min-height: {minHeight};"
	></div>
</div>

<style>
	.cm-host {
		flex: 1;
		min-height: 0;
		overflow: hidden;
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

	:global(.editor-toolbar-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		border: none;
		background: transparent;
		color: #71717a;
		cursor: pointer;
		transition:
			background 120ms ease,
			color 120ms ease;
		flex-shrink: 0;
		padding: 0;
	}

	:global(.editor-toolbar-btn:hover) {
		background: #27272a;
		color: #fafafa;
	}

	:global(.editor-toolbar-btn:disabled) {
		opacity: 0.4;
	}

	.cm-host.drag-over {
		outline: 2px dashed #f43f5e;
		outline-offset: -3px;
		background: rgba(244, 63, 94, 0.04);
	}

	.cm-host :global(.cm-scroller::-webkit-scrollbar) {
		width: 5px;
	}
	.cm-host :global(.cm-scroller::-webkit-scrollbar-track) {
		background: transparent;
	}
	.cm-host :global(.cm-scroller::-webkit-scrollbar-thumb) {
		background: #3f3f46;
		border-radius: 3px;
	}
</style>
