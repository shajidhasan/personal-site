<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormState } from '$lib/admin/forms.svelte';
	import type { Project } from '$lib/types';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';

	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import FolderGitIcon from '@lucide/svelte/icons/folder-git-2';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ImageIcon from '@lucide/svelte/icons/image';

	let { data } = $props();

	let deleteOpen = $state(false);
	let projectToDelete: Project | null = $state(null);

	const deleteForm = createFormState();
	let deleteFormEl: HTMLFormElement | undefined = $state();

	const openDelete = (item: Project) => {
		projectToDelete = item;
		deleteOpen = true;
	};
</script>

<PageHeader title="Projects" description="The projects shown on the home page and /projects.">
	{#snippet actions()}
		<Button variant="primary" href="/admin/projects/new">
			<PlusIcon class="h-4 w-4" />
			New project
		</Button>
	{/snippet}
</PageHeader>

{#if data.projects.length === 0}
	<EmptyState title="No projects yet" description="Add your first project to show it on the site.">
		{#snippet icon()}
			<FolderGitIcon class="h-8 w-8" />
		{/snippet}
		{#snippet action()}
			<Button variant="primary" href="/admin/projects/new">
				<PlusIcon class="h-4 w-4" />
				New project
			</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-800/40">
		{#each data.projects as item (item.id)}
			<div class="flex items-center gap-4 px-5 py-4">
				{#if item.iconUrl}
					<img
						src={item.iconUrl}
						alt="{item.title} icon"
						class="size-12 shrink-0 rounded-md object-cover"
						loading="lazy"
					/>
				{:else}
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-600"
					>
						<ImageIcon class="h-5 w-5" />
					</div>
				{/if}

				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<h3 class="truncate text-sm font-medium text-zinc-100">{item.title}</h3>
						{#if item.isWip}
							<span class="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
								In Progress
							</span>
						{/if}
					</div>
					<a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-zinc-500 transition-colors hover:text-rose-400"
					>
						<ExternalLinkIcon class="h-3 w-3 shrink-0" />
						<span class="truncate">{item.url}</span>
					</a>
				</div>

				<span class="hidden shrink-0 text-xs text-zinc-600 sm:inline">#{item.sortOrder}</span>

				<div class="flex shrink-0 items-center gap-1">
					<a
						href="/admin/projects/{item.id}"
						title="Edit project"
						class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
					>
						<PencilIcon class="h-4 w-4" />
					</a>
					<button
						type="button"
						onclick={() => openDelete(item)}
						title="Delete project"
						class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
					>
						<Trash2Icon class="h-4 w-4" />
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	class="hidden"
	use:enhance={deleteForm.enhance({
		successMessage: 'Project deleted.',
		onSuccess: () => {
			deleteOpen = false;
			projectToDelete = null;
		}
	})}
>
	<input type="hidden" name="id" value={projectToDelete?.id ?? ''} />
</form>

<ConfirmDialog
	bind:open={deleteOpen}
	title="Delete project"
	message={`Delete “${projectToDelete?.title ?? ''}”? This cannot be undone.`}
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>
