<script lang="ts">
	import SeeMoreLink from '$lib/components/shared/SeeMoreLink.svelte';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { Project } from '$lib/types';

	let { projects }: { projects: Project[] } = $props();
</script>

<!-- Compact rows on the home page — the full cards live on /projects -->
{#snippet row(project: Project)}
	{#if project.iconUrl}
		<img
			src={project.iconUrl}
			alt="{project.title} logo"
			class="size-12 shrink-0 rounded-lg"
			loading="lazy"
			width="48"
			height="48"
		/>
	{/if}

	<div class="min-w-0 flex-1">
		<div class="flex items-center gap-2">
			<h3 class="truncate font-medium text-gray-900 dark:text-gray-100">{project.title}</h3>
			{#if project.isWip}
				<span
					class="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
				>
					In Progress
				</span>
			{:else}
				<ExternalLinkIcon
					class="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				/>
			{/if}
		</div>
		<p class="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
			{project.description}
		</p>
	</div>
{/snippet}

<section id="projects" class="bg-gray-100 py-16 dark:bg-gray-800/20">
	<div class="mx-auto max-w-4xl px-6">
		<h2 class="mb-8 text-3xl font-light text-gray-900 dark:text-gray-100">Projects</h2>
		<div class="grid gap-4 md:grid-cols-2">
			{#each projects as project (project.id)}
				{#if project.isWip}
					<div class="flex items-start gap-4 rounded-lg bg-white p-4 dark:bg-gray-800">
						{@render row(project)}
					</div>
				{:else}
					<a
						href={project.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex items-start gap-4 rounded-lg border border-transparent bg-white p-4
                       transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200
                       hover:shadow-lg hover:shadow-gray-100/50 dark:bg-gray-800 dark:hover:border-gray-700 dark:hover:shadow-lg dark:hover:shadow-black/20"
					>
						{@render row(project)}
					</a>
				{/if}
			{/each}
		</div>
	</div>

	<SeeMoreLink href="/projects" title="View More Projects" />
</section>
