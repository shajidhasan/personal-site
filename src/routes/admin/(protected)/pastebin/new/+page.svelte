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

	let title = $state('');
	let alias = $state('');
	let language = $state('plaintext');
	let content = $state('');

	let contentHtml = $state('');
	// True while shiki is highlighting the content just before submit.
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	const snapshot = () => JSON.stringify({ title, alias, language, content });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);

	// Highlight the content in the browser (shiki is too heavy for the Worker),
	// stash it in the hidden input, then submit the form.
	const onCreate = async () => {
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

<PageHeader title="Create paste" description="Share text snippets and code." />

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async (result) => {
			savedSnapshot = snapshot();
			const pasteAlias = (result.data?.alias as string | undefined) ?? alias.trim();
			if (pasteAlias) {
				try {
					await navigator.clipboard.writeText(`${window.location.origin}/p/${pasteAlias}`);
					toaster.success('New paste created and link copied!');
				} catch {
					toaster.success('New paste created!');
				}
			} else {
				toaster.success('New paste created!');
			}
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

<PasteForm bind:title bind:alias bind:language bind:content errors={form.errors} />

<div
	class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
>
	<div class="flex items-center justify-end gap-3">
		<Button variant="ghost" href="/admin/pastebin">Cancel</Button>
		<Button variant="primary" loading={rendering || form.submitting} onclick={onCreate}>
			<SaveIcon class="h-4 w-4" />
			Create paste
		</Button>
	</div>
</div>
