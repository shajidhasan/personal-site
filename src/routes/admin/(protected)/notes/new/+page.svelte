<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { generateRandomString } from '$lib/utilities';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import NoteForm from '$lib/components/admin/NoteForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let title = $state('');
	let alias = $state(generateRandomString(8).toLowerCase());
	let content = $state('');

	let contentHtml = $state('');
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	const snapshot = () => JSON.stringify({ title, alias, content });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);

	const onCreate = async () => {
		if (!title.trim()) {
			toaster.error('Title is required.');
			return;
		}

		rendering = true;

		try {
			// Rendered in the browser — the markdown pipeline is too heavy for the Worker.
			contentHtml = await renderMarkdown(content);
		} catch {
			toaster.error('Failed to render content. Please try again.');
			rendering = false;
			return;
		}

		await tick();
		formEl?.requestSubmit();
		rendering = false;
	};
</script>

<PageHeader title="Create note" description="Write and share your notes and snippets." />

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			const noteAlias = alias.trim();
			if (noteAlias) {
				try {
					await navigator.clipboard.writeText(`${window.location.origin}/n/${noteAlias}`);
					toaster.success('New note created and link copied!');
				} catch {
					toaster.success('New note created!');
				}
			} else {
				toaster.success('New note created!');
			}
			await goto('/admin/notes');
		}
	})}
>
	<input type="hidden" name="title" value={title} />
	<input type="hidden" name="alias" value={alias} />
	<input type="hidden" name="content" value={content} />
	<input type="hidden" name="contentHtml" value={contentHtml} />
</form>

<NoteForm bind:title bind:alias bind:content errors={form.errors} />

<div
	class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
>
	<div class="flex items-center justify-end gap-3">
		<Button variant="ghost" href="/admin/notes">Cancel</Button>
		<Button variant="primary" loading={rendering || form.submitting} onclick={onCreate}>
			<SaveIcon class="h-4 w-4" />
			Save note
		</Button>
	</div>
</div>
