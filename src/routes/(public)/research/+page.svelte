<script lang="ts">
	import PageHeader from '$lib/components/shared/PageHeader.svelte';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { ResearchPaper } from '$lib/types';

	let { data } = $props();

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

	// Bold my own name in author lists
	const isMe = (author: string) =>
		author.trim().toLowerCase() === data.settings.identity.fullName.toLowerCase();
</script>

<main class="bg-gray-100 pt-28 pb-16 md:pt-32 dark:bg-gray-900">
	<div class="mx-auto max-w-4xl px-6">
		<PageHeader title="Research" subtitle="Publications, preprints, and other academic work." />

		{#if data.papers.length === 0}
			<p class="pb-16 text-lg text-gray-600 dark:text-gray-400">No publications yet.</p>
		{:else}
			<div class="space-y-12">
				{#each byYear as [year, papers] (year)}
					<section>
						<h2 class="mb-6 text-2xl font-light text-gray-900 dark:text-gray-100">{year}</h2>
						<div class="space-y-6">
							{#each papers as paper (paper.id)}
								<article class="rounded-lg border border-transparent bg-white p-6 dark:bg-gray-800">
									<a href={paper.url} target="_blank" rel="noopener noreferrer" class="group block">
										<h3
											class="text-lg font-medium text-gray-900 transition-colors group-hover:text-rose-600 dark:text-gray-100 dark:group-hover:text-rose-400"
										>
											{paper.title}
											<ExternalLinkIcon
												class="ml-1 inline h-4 w-4 align-baseline opacity-0 transition-opacity group-hover:opacity-80"
											/>
										</h3>
									</a>

									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
										{#each paper.authors as author, index (index)}{index > 0
												? ', '
												: ''}{#if isMe(author)}<strong
													class="font-semibold text-gray-800 dark:text-gray-200">{author}</strong
												>{:else}{author}{/if}{/each}
									</p>

									<p class="mt-1 text-sm text-gray-500 dark:text-gray-500">
										{#if paper.venue}{paper.venue} ·
										{/if}{year}
										{#if paper.doi}
											· <span class="font-mono text-xs">doi:{paper.doi}</span>
										{/if}
									</p>

									{#if paper.abstract}
										<details class="mt-3">
											<summary
												class="cursor-pointer text-sm text-gray-500 transition-colors select-none hover:text-gray-700 dark:hover:text-gray-300"
											>
												Abstract
											</summary>
											<p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
												{paper.abstract}
											</p>
										</details>
									{/if}

									{#if paper.tags.length > 0}
										<div class="mt-3 flex flex-wrap gap-2">
											{#each paper.tags as tag (tag)}
												<span
													class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
												>
													{tag}
												</span>
											{/each}
										</div>
									{/if}
								</article>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</div>
</main>
