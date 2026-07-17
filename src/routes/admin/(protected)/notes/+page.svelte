<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { toaster } from '$lib/services/toaster.svelte';
	import { formatTimestamp } from '$lib/utilities';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';

	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import EyeIcon from '@lucide/svelte/icons/eye';

	import type { Note } from '$lib/types';

	let { data } = $props();

	const notes = $derived(data.notes);
	let searchTerm = $state('');

	const deleteForm = createFormState();

	let deleteOpen = $state(false);
	let noteToDelete: Note | null = $state(null);
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDeleteDialog = (note: Note) => {
		noteToDelete = note;
		deleteOpen = true;
	};

	const copyNoteUrl = async (alias: string) => {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/n/${alias}`);
			toaster.success('URL copied to clipboard!');
		} catch {
			toaster.error('Failed to copy URL.');
		}
	};

	const getContentPreview = (content: string, maxLength: number = 100): string => {
		if (!content) return 'No content preview.';
		const firstLine = content.split('\n')[0];
		if (firstLine.length <= maxLength) return firstLine;
		return firstLine.substring(0, maxLength - 3) + '...';
	};

	const filteredNotes = $derived.by(() => {
		if (!searchTerm.trim()) return notes;
		const lowerSearchTerm = searchTerm.toLowerCase();
		return notes.filter(
			(note) =>
				note.title.toLowerCase().includes(lowerSearchTerm) ||
				note.alias.toLowerCase().includes(lowerSearchTerm) ||
				note.content.toLowerCase().includes(lowerSearchTerm)
		);
	});
</script>

<PageHeader title="Notes" description="Create, edit, and manage your notes and snippets.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/notes/new">
			<PlusIcon class="h-4 w-4" />
			New note
		</Button>
	{/snippet}
</PageHeader>

<div class="relative mb-6 sm:max-w-md">
	<input
		type="search"
		bind:value={searchTerm}
		placeholder="Search notes..."
		class="block w-full rounded-md border border-zinc-700 bg-zinc-800 py-2.5 pr-3.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
	/>
	<SearchIcon
		class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
	/>
</div>

{#if filteredNotes.length === 0}
	{#if searchTerm}
		<EmptyState
			title="No notes found"
			description={`No notes matched your search for "${searchTerm}".`}
		>
			{#snippet icon()}
				<SearchIcon class="h-8 w-8" />
			{/snippet}
		</EmptyState>
	{:else}
		<EmptyState title="No notes yet" description="Start by creating your first note.">
			{#snippet icon()}
				<StickyNoteIcon class="h-8 w-8" />
			{/snippet}
			{#snippet action()}
				<Button variant="primary" href="/admin/notes/new">
					<PlusIcon class="h-4 w-4" />
					Create first note
				</Button>
			{/snippet}
		</EmptyState>
	{/if}
{:else}
	<div class="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-800/40">
		{#each filteredNotes as note (note.id)}
			<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
				<div class="min-w-0 flex-1">
					<a
						href="/admin/notes/{note.id}"
						class="block truncate text-sm font-medium text-zinc-100 transition-colors hover:text-rose-400"
						title={note.title}
					>
						{note.title || 'Untitled note'}
					</a>
					<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
						<a
							href="/n/{note.alias}"
							target="_blank"
							rel="noopener noreferrer"
							class="font-mono transition-colors hover:text-zinc-300"
							title={`View note: /n/${note.alias}`}
						>
							/n/{note.alias}
						</a>
						<span>{formatTimestamp(note.createdAt)}</span>
						<span class="truncate text-zinc-600">{getContentPreview(note.content, 80)}</span>
					</div>
				</div>

				<div class="flex shrink-0 items-center gap-3">
					<span class="flex items-center gap-1 text-xs text-zinc-500" title="Visits">
						<EyeIcon class="h-3.5 w-3.5" />
						{note.visitCount}
					</span>

					<button
						type="button"
						onclick={() => copyNoteUrl(note.alias)}
						title="Copy note URL"
						aria-label="Copy note URL"
						class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
					>
						<CopyIcon class="h-4 w-4" />
					</button>
					<a
						href="/admin/notes/{note.id}"
						title="Edit note"
						aria-label="Edit note"
						class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
					>
						<PencilIcon class="h-4 w-4" />
					</a>
					<button
						type="button"
						onclick={() => openDeleteDialog(note)}
						title="Delete note"
						aria-label="Delete note"
						class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
					>
						<Trash2Icon class="h-4 w-4" />
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<form
	method="POST"
	action="?/delete"
	bind:this={deleteFormEl}
	class="hidden"
	use:enhance={deleteForm.enhance({
		noReset: true,
		onSuccess: () => {
			const title = noteToDelete?.title;
			deleteOpen = false;
			noteToDelete = null;
			toaster.success(`"${title}" deleted successfully.`);
		}
	})}
>
	<input type="hidden" name="id" value={noteToDelete?.id ?? ''} />
</form>

<ConfirmDialog
	bind:open={deleteOpen}
	title="Delete note"
	message={`Are you sure you want to permanently delete "${noteToDelete?.title}"? This action cannot be undone.`}
	confirmLabel="Delete note"
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>
