<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import { toaster } from '$lib/services/toaster.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import type { ShortLink } from '$lib/types';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';

	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import LinkIcon from '@lucide/svelte/icons/link';
	import MessageSquareTextIcon from '@lucide/svelte/icons/message-square-text';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { data } = $props();

	const shortLinks = $derived(data.shortLinks);
	let searchTerm = $state('');

	const deleteForm = createFormState();

	let deleteOpen = $state(false);
	let linkToDelete: ShortLink | null = $state(null);
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDeleteDialog = (link: ShortLink) => {
		linkToDelete = link;
		deleteOpen = true;
	};

	const copyShortUrl = async (alias: string) => {
		const url = `${window.location.origin}/l/${alias}`;
		try {
			await navigator.clipboard.writeText(url);
			toaster.success('Shortlink copied to clipboard!');
		} catch {
			toaster.error('Failed to copy URL.');
		}
	};

	const filteredLinks = $derived.by(() => {
		if (!searchTerm.trim()) return shortLinks;
		const lowerSearchTerm = searchTerm.toLowerCase();
		return shortLinks.filter(
			(link) =>
				link.alias.toLowerCase().includes(lowerSearchTerm) ||
				link.destinationUrl.toLowerCase().includes(lowerSearchTerm) ||
				(link.message && link.message.toLowerCase().includes(lowerSearchTerm))
		);
	});

	const getFaviconUrl = (destinationUrl: string) => {
		try {
			const url = new URL(destinationUrl);
			return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
		} catch {
			return '';
		}
	};
</script>

<PageHeader title="URL Shortener" description="Create and manage your short links.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/url-shortener/new">
			<PlusIcon class="h-4 w-4" />
			New link
		</Button>
	{/snippet}
</PageHeader>

<div class="relative mb-6 sm:max-w-md">
	<input
		type="search"
		bind:value={searchTerm}
		placeholder="Search links..."
		class="block w-full rounded-md border border-zinc-700 bg-zinc-800 py-2.5 pr-3.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
	/>
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<SearchIcon class="h-4 w-4 text-zinc-500" />
	</div>
</div>

{#if filteredLinks.length === 0}
	<EmptyState
		title={searchTerm ? 'No links found' : 'No shortlinks yet'}
		description={searchTerm
			? `No links matched your search for "${searchTerm}".`
			: 'Start by creating your first shortlink.'}
	>
		{#snippet icon()}
			<LinkIcon class="h-8 w-8" />
		{/snippet}
		{#snippet action()}
			{#if !searchTerm}
				<Button variant="primary" href="/admin/url-shortener/new">
					<PlusIcon class="h-4 w-4" />
					New link
				</Button>
			{/if}
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each filteredLinks as link, i (link.id)}
			<div
				animate:flip={{ duration: 300 }}
				in:fly|global={{ delay: i * 50, y: 20, duration: 250 }}
				class="group rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800/70"
			>
				<div class="mb-3 flex items-start gap-2.5">
					<img
						src={getFaviconUrl(link.destinationUrl)}
						alt="Favicon"
						class="mt-0.5 h-5 w-5 shrink-0 rounded-sm border border-zinc-600 bg-zinc-700 object-contain p-0.5"
						width="20"
						height="20"
						loading="lazy"
					/>
					<div class="min-w-0 flex-grow">
						<a
							href={`/l/${link.alias}`}
							target="_blank"
							rel="noopener noreferrer"
							class="block truncate font-mono text-base font-medium text-zinc-100 transition-colors duration-200 hover:text-rose-400"
							title={`Visit shortlink: /l/${link.alias}`}
						>
							/{link.alias}
						</a>
						<p class="mt-1 truncate text-xs text-zinc-400" title={link.destinationUrl}>
							<ExternalLinkIcon class="mr-1 inline h-2.5 w-2.5" />
							{link.destinationUrl}
						</p>
					</div>
				</div>

				{#if link.message}
					<div class="mb-3 rounded border border-zinc-700/70 bg-zinc-900/60 p-2.5">
						<div class="flex items-center gap-1.5">
							<MessageSquareTextIcon class="h-3 w-3 shrink-0 text-zinc-400" />
							<p class="truncate text-xs text-zinc-300 italic">
								{link.message}
							</p>
						</div>
					</div>
				{/if}

				<div class="flex items-center justify-between border-t border-zinc-800 pt-3">
					<div class="text-xs text-zinc-500">
						{link.visitCount} visits
					</div>
					<div class="flex items-center gap-1">
						<button
							onclick={() => copyShortUrl(link.alias)}
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-700 hover:text-zinc-200"
						>
							<CopyIcon class="h-3.5 w-3.5" />
							<span>Copy</span>
						</button>
						<a
							href="/admin/url-shortener/{link.id}"
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-700 hover:text-zinc-200"
						>
							<PencilIcon class="h-3.5 w-3.5" />
							<span>Edit</span>
						</a>
						<button
							onclick={() => openDeleteDialog(link)}
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
	title="Delete shortlink"
	message={`Are you sure you want to permanently delete /${linkToDelete?.alias ?? ''}? This action cannot be undone.`}
	confirmLabel="Delete link"
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>

<form
	method="POST"
	action="?/delete"
	bind:this={deleteFormEl}
	use:enhance={deleteForm.enhance({
		successMessage: 'Shortlink deleted successfully!',
		onSuccess: () => {
			deleteOpen = false;
			linkToDelete = null;
		}
	})}
	class="hidden"
>
	<input type="hidden" name="id" value={linkToDelete?.id ?? ''} />
</form>
