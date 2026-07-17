<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import NoteForm from '$lib/components/admin/NoteForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { data } = $props();

	// Intentionally capture the loaded note once to seed the form.
	// svelte-ignore state_referenced_locally
	const note = data.note;

	let title = $state(note.title);
	let alias = $state(note.alias);
	let content = $state(note.content);

	let contentHtml = $state('');
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	// Dirty check compares the current fields against the values loaded
	// from the server (re-snapshotted after a successful save).
	const snapshot = () => JSON.stringify({ title, alias, content });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);

	const onUpdate = async () => {
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

<PageHeader title="Edit note" description="Update your note content and settings." />

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Note updated successfully!');
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
		<Button variant="primary" loading={rendering || form.submitting} onclick={onUpdate}>
			<SaveIcon class="h-4 w-4" />
			Update note
		</Button>
	</div>
</div>
