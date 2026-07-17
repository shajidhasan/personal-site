<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { highlightCode } from '$lib/markdown';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import PasteForm from '$lib/components/admin/PasteForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { data } = $props();

	// Intentionally capture the loaded paste once to seed the form.
	// svelte-ignore state_referenced_locally
	const paste = data.paste;

	let title = $state(paste.title);
	let alias = $state(paste.alias);
	let language = $state(paste.language);
	let content = $state(paste.content);

	let contentHtml = $state('');
	// True while shiki is highlighting the content just before submit.
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	// Dirty check compares the current fields against the values loaded
	// from the server (re-snapshotted after a successful save).
	const snapshot = () => JSON.stringify({ title, alias, language, content });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);

	// Highlight the content in the browser (shiki is too heavy for the Worker),
	// stash it in the hidden input, then submit the form.
	const onUpdate = async () => {
		if (!title.trim()) {
			toaster.error('Title is required.');
			return;
		}
		if (!content.trim()) {
			toaster.error('Content is required.');
			return;
		}

		rendering = true;

		try {
			contentHtml = await highlightCode(content, language || 'plaintext');
		} catch {
			try {
				contentHtml = await highlightCode(content, 'text');
			} catch {
				toaster.error('Failed to highlight content. Please try again.');
				rendering = false;
				return;
			}
		}

		await tick();
		formEl?.requestSubmit();
		rendering = false;
	};
</script>

<PageHeader title="Edit paste" description={`/p/${paste.alias}`} />

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Paste updated successfully!');
			await goto('/admin/pastebin');
		}
	})}
>
	<input type="hidden" name="title" value={title} />
	<input type="hidden" name="alias" value={alias} />
	<input type="hidden" name="language" value={language} />
	<input type="hidden" name="content" value={content} />
	<input type="hidden" name="contentHtml" value={contentHtml} />
</form>

<PasteForm
	bind:title
	bind:alias
	bind:language
	bind:content
	aliasHint="Changing this will alter the paste URL."
	errors={form.errors}
/>

<div
	class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
>
	<div class="flex items-center justify-end gap-3">
		<Button variant="ghost" href="/admin/pastebin">Cancel</Button>
		<Button variant="primary" loading={rendering || form.submitting} onclick={onUpdate}>
			<SaveIcon class="h-4 w-4" />
			Save changes
		</Button>
	</div>
</div>
