<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormState } from '$lib/admin/forms.svelte';
	import type { ResearchPaper } from '$lib/types';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';

	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import StarIcon from '@lucide/svelte/icons/star';

	let { data } = $props();

	let deleteOpen = $state(false);
	let paperToDelete: ResearchPaper | null = $state(null);

	const deleteForm = createFormState();
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDelete = (paper: ResearchPaper) => {
		paperToDelete = paper;
		deleteOpen = true;
	};

	// Group by year for display (list already arrives year desc, sortOrder asc)
	const byYear = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- built fresh on every recompute and never mutated afterwards; reactivity comes from the $derived
		const groups = new Map<number, ResearchPaper[]>();
		for (const paper of data.papers) {
			const list = groups.get(paper.year) ?? [];
			list.push(paper);
			groups.set(paper.year, list);
		}
		return [...groups.entries()];
	});
</script>

<PageHeader title="Research" description="Publications listed on /research and the home page.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/research/new">
			<PlusIcon class="h-4 w-4" />
			New paper
		</Button>
	{/snippet}
</PageHeader>

{#if data.papers.length === 0}
	<EmptyState
		title="No papers yet"
		description="The public research page and navbar link stay hidden until you add one."
	>
		{#snippet icon()}
			<GraduationCapIcon class="h-8 w-8" />
		{/snippet}
		{#snippet action()}
			<Button variant="primary" href="/admin/research/new">
				<PlusIcon class="h-4 w-4" />
				New paper
			</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="space-y-8">
		{#each byYear as [year, papers] (year)}
			<section>
				<h2 class="mb-3 text-sm font-semibold tracking-widest text-zinc-500 uppercase">{year}</h2>
				<div class="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-800/40">
					{#each papers as paper (paper.id)}
						<div class="flex items-start gap-4 px-5 py-4">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<h3 class="text-sm font-medium text-zinc-100">{paper.title}</h3>
									{#if paper.isFeatured}
										<span
											class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300"
										>
											<StarIcon class="h-3 w-3" />
											Featured
										</span>
									{/if}
									{#if !paper.isPublished}
										<span
											class="shrink-0 rounded-full bg-zinc-700/60 px-2 py-0.5 text-xs text-zinc-400"
										>
											Hidden
										</span>
									{/if}
								</div>
								<p class="mt-1 truncate text-xs text-zinc-400">{paper.authors.join(', ')}</p>
								<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
									{#if paper.venue}<span>{paper.venue}</span>{/if}
									<a
										href={paper.url}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 font-mono transition-colors hover:text-rose-400"
									>
										<ExternalLinkIcon class="h-3 w-3" />
										link
									</a>
									{#if paper.doi}<span class="font-mono">doi:{paper.doi}</span>{/if}
								</div>
							</div>

							<div class="flex shrink-0 items-center gap-1">
								<a
									href="/admin/research/{paper.id}"
									title="Edit paper"
									class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
								>
									<PencilIcon class="h-4 w-4" />
								</a>
								<button
									type="button"
									onclick={() => openDelete(paper)}
									title="Delete paper"
									class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
								>
									<Trash2Icon class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
{/if}

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	class="hidden"
	use:enhance={deleteForm.enhance({
		successMessage: 'Paper deleted.',
		onSuccess: () => {
			deleteOpen = false;
			paperToDelete = null;
		}
	})}
>
	<input type="hidden" name="id" value={paperToDelete?.id ?? ''} />
</form>

<ConfirmDialog
	bind:open={deleteOpen}
	title="Delete paper"
	message={`Delete “${paperToDelete?.title ?? ''}”? This cannot be undone.`}
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>
