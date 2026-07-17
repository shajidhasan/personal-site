<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import { formatTimestamp } from '$lib/utilities';
	import { toaster } from '$lib/services/toaster.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import type { Paste } from '$lib/types';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';

	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ClipboardIcon from '@lucide/svelte/icons/clipboard';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { data } = $props();

	let searchTerm = $state('');
	const pastes = $derived(data.pastes);

	const deleteForm = createFormState();

	let deleteOpen = $state(false);
	let pasteToDelete: Paste | null = $state(null);
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDeleteDialog = (paste: Paste) => {
		pasteToDelete = paste;
		deleteOpen = true;
	};

	const copyPasteUrl = async (alias: string) => {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/p/${alias}`);
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

	const filteredPastes = $derived.by(() => {
		if (!searchTerm.trim()) return pastes;
		const lowerSearchTerm = searchTerm.toLowerCase();
		return pastes.filter(
			(paste) =>
				paste.title.toLowerCase().includes(lowerSearchTerm) ||
				paste.alias.toLowerCase().includes(lowerSearchTerm) ||
				paste.language.toLowerCase().includes(lowerSearchTerm) ||
				paste.content.toLowerCase().includes(lowerSearchTerm)
		);
	});
</script>

<PageHeader title="Pastebin" description="Share text snippets and code.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/pastebin/new">
			<PlusIcon class="h-4 w-4" />
			New paste
		</Button>
	{/snippet}
</PageHeader>

<div class="relative mb-6 sm:max-w-md">
	<input
		type="search"
		bind:value={searchTerm}
		placeholder="Search pastes..."
		class="block w-full rounded-md border border-zinc-700 bg-zinc-800 py-2.5 pr-3.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
	/>
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<SearchIcon class="h-4 w-4 text-zinc-500" />
	</div>
</div>

{#if filteredPastes.length === 0}
	<EmptyState
		title={searchTerm ? 'No pastes found' : 'No pastes yet'}
		description={searchTerm
			? `No pastes matched your search for "${searchTerm}".`
			: 'Start by creating your first paste.'}
	>
		{#snippet icon()}
			<ClipboardIcon class="h-8 w-8" />
		{/snippet}
		{#snippet action()}
			{#if !searchTerm}
				<Button variant="primary" href="/admin/pastebin/new">
					<PlusIcon class="h-4 w-4" />
					New paste
				</Button>
			{/if}
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each filteredPastes as paste, i (paste.id)}
			<div
				animate:flip={{ duration: 300 }}
				in:fly|global={{ delay: i * 50, y: 20, duration: 250 }}
				class="group rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800/70"
			>
				<div class="mb-3">
					<h3 class="mb-1.5 truncate text-base font-medium text-zinc-100" title={paste.title}>
						{paste.title || 'Untitled Paste'}
					</h3>
					<a
						href={`/p/${paste.alias}`}
						target="_blank"
						rel="noopener noreferrer"
						class="block font-mono text-xs text-zinc-400 transition-colors duration-200 hover:text-rose-400"
						title={`View paste: /p/${paste.alias}`}
					>
						<ExternalLinkIcon class="mr-1 inline h-3 w-3" />
						/p/{paste.alias}
					</a>
				</div>

				<div class="mb-3 flex items-center gap-2 text-sm">
					<span class="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
						{paste.language || 'plaintext'}
					</span>
					<span class="text-xs text-zinc-500">{formatTimestamp(paste.createdAt)}</span>
				</div>

				<div class="mb-4">
					<div class="rounded border border-zinc-700/70 bg-zinc-900/60 p-2.5">
						<pre class="line-clamp-3 text-xs text-zinc-300">{getContentPreview(
								paste.content,
								80
							)}</pre>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<div class="text-xs text-zinc-500">
						{paste.visitCount || 0} visits
					</div>

					<div class="flex items-center gap-1">
						<button
							onclick={() => copyPasteUrl(paste.alias)}
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-700 hover:text-zinc-200"
						>
							<CopyIcon class="h-3.5 w-3.5" />
							<span>Copy</span>
						</button>
						<a
							href="/admin/pastebin/{paste.id}"
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-700 hover:text-zinc-200"
						>
							<PencilIcon class="h-3.5 w-3.5" />
							<span>Edit</span>
						</a>
						<button
							onclick={() => openDeleteDialog(paste)}
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
						>
							<Trash2Icon class="h-3.5 w-3.5" />
							<span>Delete</span>
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<ConfirmDialog
	bind:open={deleteOpen}
	title="Delete paste"
	message={`Are you sure you want to permanently delete "${pasteToDelete?.title || 'Untitled Paste'}"? This action cannot be undone.`}
	confirmLabel="Delete paste"
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>

<form
	method="POST"
	action="?/delete"
	bind:this={deleteFormEl}
	use:enhance={deleteForm.enhance({
		successMessage: 'Paste deleted successfully!',
		onSuccess: () => {
			deleteOpen = false;
			pasteToDelete = null;
		}
	})}
	class="hidden"
>
	<input type="hidden" name="id" value={pasteToDelete?.id ?? ''} />
</form>
