<script lang="ts">
	import SeeMoreLink from '$lib/components/shared/SeeMoreLink.svelte';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { ResearchPaper } from '$lib/types';

	let { papers }: { papers: ResearchPaper[] } = $props();
</script>

<!-- Renders nothing at all when there are no featured papers -->
{#if papers.length > 0}
	<section id="research" class="py-16">
		<div class="mx-auto max-w-4xl px-6">
			<h2 class="mb-12 text-3xl font-light text-gray-900 dark:text-gray-100">Research</h2>
			<div class="space-y-6">
				{#each papers as paper (paper.id)}
					<a
						href={paper.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group block rounded-lg border border-transparent bg-white p-6 transition-all duration-300
                       hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50
                       dark:bg-gray-800 dark:hover:border-gray-700 dark:hover:shadow-lg dark:hover:shadow-black/20"
					>
						<div class="flex items-start justify-between gap-4">
							<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
								{paper.title}
							</h3>
							<span
								class="mt-1 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-80"
							>
								<ExternalLinkIcon class="h-4 w-4" />
							</span>
						</div>
						<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
							{paper.authors.join(', ')}
						</p>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-500">
							{#if paper.venue}{paper.venue} ·
							{/if}{paper.year}
						</p>
					</a>
				{/each}
			</div>
		</div>

		<SeeMoreLink href="/research" title="View All Publications" />
	</section>
{/if}
