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
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import EyeIcon from '@lucide/svelte/icons/eye';

	import type { BlogPost } from '$lib/types';

	let { data } = $props();

	const blogPosts = $derived(data.blogPosts);
	let searchTerm = $state('');

	const deleteForm = createFormState();
	const toggleForm = createFormState();

	let deleteOpen = $state(false);
	let postToDelete: BlogPost | null = $state(null);
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDeleteDialog = (post: BlogPost) => {
		postToDelete = post;
		deleteOpen = true;
	};

	const filteredPosts = $derived.by(() => {
		if (!searchTerm.trim()) return blogPosts;
		const lowerSearch = searchTerm.toLowerCase();
		return blogPosts.filter(
			(post) =>
				post.title.toLowerCase().includes(lowerSearch) ||
				post.slug.toLowerCase().includes(lowerSearch) ||
				(post.tags && post.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))) ||
				(post.excerpt && post.excerpt.toLowerCase().includes(lowerSearch))
		);
	});
</script>

<PageHeader title="Blog posts" description="Create, edit, and manage your articles.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/blog/new">
			<PlusIcon class="h-4 w-4" />
			New post
		</Button>
	{/snippet}
</PageHeader>

<div class="relative mb-6 sm:max-w-md">
	<input
		type="search"
		bind:value={searchTerm}
		placeholder="Search posts..."
		class="block w-full rounded-md border border-zinc-700 bg-zinc-800 py-2.5 pr-3.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
	/>
	<SearchIcon
		class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
	/>
</div>

{#if filteredPosts.length === 0}
	{#if searchTerm}
		<EmptyState
			title="No posts found"
			description={`No posts matched your search for "${searchTerm}".`}
		>
			{#snippet icon()}
				<SearchIcon class="h-8 w-8" />
			{/snippet}
		</EmptyState>
	{:else}
		<EmptyState title="No blog posts yet" description="Start by creating your first blog post.">
			{#snippet icon()}
				<NewspaperIcon class="h-8 w-8" />
			{/snippet}
			{#snippet action()}
				<Button variant="primary" href="/admin/blog/new">
					<PlusIcon class="h-4 w-4" />
					Create first post
				</Button>
			{/snippet}
		</EmptyState>
	{/if}
{:else}
	<div class="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-800/40">
		{#each filteredPosts as post (post.id)}
			<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
				<div class="min-w-0 flex-1">
					<a
						href="/admin/blog/{post.id}"
						class="block truncate text-sm font-medium text-zinc-100 transition-colors hover:text-rose-400"
						title={post.title}
					>
						{post.title || 'Untitled post'}
					</a>
					<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
						<a
							href="/blog/{post.slug}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 font-mono transition-colors hover:text-zinc-300"
							title={`View live post: /blog/${post.slug}`}
						>
							<ExternalLinkIcon class="h-3 w-3" />
							/blog/{post.slug}
						</a>
						<span>{formatTimestamp(post.updatedAt)}</span>
						{#if post.tags && post.tags.length > 0}
							<span class="flex flex-wrap gap-1">
								{#each post.tags.slice(0, 3) as tag (tag)}
									<span class="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{tag}</span>
								{/each}
								{#if post.tags.length > 3}
									<span class="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
										+{post.tags.length - 3}
									</span>
								{/if}
							</span>
						{/if}
					</div>
				</div>

				<div class="flex shrink-0 items-center gap-3">
					<span class="flex items-center gap-1 text-xs text-zinc-500" title="Visits">
						<EyeIcon class="h-3.5 w-3.5" />
						{post.visitCount}
					</span>

					<form
						method="POST"
						action="?/togglePublish"
						use:enhance={toggleForm.enhance({
							noReset: true,
							onSuccess: (result) =>
								toaster.success((result.data?.message as string) ?? 'Publish status updated.')
						})}
					>
						<input type="hidden" name="id" value={post.id} />
						<button
							type="submit"
							title={post.isPublished ? 'Click to unpublish' : 'Click to publish'}
							class="rounded-full px-2 py-0.5 text-xs transition-colors {post.isPublished
								? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
								: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}"
						>
							{post.isPublished ? 'Published' : 'Draft'}
						</button>
					</form>

					<a
						href="/admin/blog/{post.id}"
						title="Edit post"
						aria-label="Edit post"
						class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
					>
						<PencilIcon class="h-4 w-4" />
					</a>
					<button
						type="button"
						onclick={() => openDeleteDialog(post)}
						title="Delete post"
						aria-label="Delete post"
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
			const title = postToDelete?.title;
			deleteOpen = false;
			postToDelete = null;
			toaster.success(`"${title}" deleted successfully.`);
		}
	})}
>
	<input type="hidden" name="id" value={postToDelete?.id ?? ''} />
</form>

<ConfirmDialog
	bind:open={deleteOpen}
	title="Delete post"
	message={`Are you sure you want to permanently delete "${postToDelete?.title}"? This action cannot be undone.`}
	confirmLabel="Delete post"
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>
