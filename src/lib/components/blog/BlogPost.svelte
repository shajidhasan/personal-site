<script lang="ts">
	import '$lib/components/shared/CodeBlock.svelte';
	import Giscus from '$lib/components/blog/Giscus.svelte';
	import { formatDate } from '$lib/utilities';
	import { page } from '$app/state';
	import type { BlogPost } from '$lib/types';
	import sh4jid from '$lib/assets/sh4jid.jpg';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	interface Props {
		blogPost: BlogPost;
		contentHtml: string;
	}

	let { blogPost, contentHtml }: Props = $props();

	let title = $derived(blogPost.title);
	let readTimeMinutes = $derived(blogPost.readTimeMinutes);
	let date = $derived((blogPost.publishedAt ?? blogPost.createdAt).toISOString().split('T')[0]);
	let tags = $derived(blogPost.tags);
	let featuredImageUrl = $derived(blogPost.featuredImageUrl);
</script>

<main class="pt-20 sm:pt-24 md:pt-32">
	<div class="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
		<header class="mb-10 md:mb-12">
			<h1
				class="mb-6 text-3xl leading-tight font-medium text-gray-800 sm:text-4xl md:text-5xl dark:text-gray-200"
			>
				{title}
			</h1>

			<!-- Meta Information -->
			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<time datetime={date} class="whitespace-nowrap">{formatDate(date)}</time>
					<span>•</span>
					<span class="whitespace-nowrap">{readTimeMinutes} min read</span>
					<span>•</span>
					<span class="whitespace-nowrap"
						>By {page.data.settings?.identity.fullName ?? 'Shajid Hasan Naim'}</span
					>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
						<svg
							class="h-3.5 w-3.5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
							<path
								fill-rule="evenodd"
								d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>{blogPost.visitCount.toLocaleString()} views</span>
					</div>

					<!-- Tags -->
					{#if tags.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each tags as tag (tag)}
								<span
									class="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</header>

		<!-- Featured Image -->
		<figure class="mb-10 md:mb-12">
			<img
				src={featuredImageUrl}
				alt={title}
				class="h-auto max-h-80 w-full rounded-xl object-cover shadow-lg sm:aspect-[2/1]"
			/>
		</figure>

		<!-- Article Content -->
		<article
			class="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-rose-600 dark:prose-a:text-rose-400 prose-strong:text-gray-800 dark:prose-strong:text-gray-200"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted admin-authored HTML rendered at save time -->
			{@html contentHtml}
		</article>

		<div class="mt-16 border-t border-gray-200 pt-12 dark:border-gray-700">
			<div class="flex items-start gap-6">
				<div class="h-16 w-16 overflow-clip rounded-full">
					<img
						src={page.data.settings?.identity.avatarUrl ?? sh4jid}
						alt={page.data.settings?.identity.fullName ?? 'Shajid Hasan Naim'}
						class="h-full w-full rounded-full object-cover object-top"
					/>
				</div>
				<div class="flex-1">
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
						{page.data.settings?.identity.fullName ?? 'Shajid Hasan Naim'}
					</h3>
					<p class="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
						Mechanical engineering student who got into coding and can't stop building things. I
						write about the projects I'm working on and whatever random tech stuff catches my
						attention.
					</p>
					<div class="mt-4">
						<a
							href="https://twitter.com/sh4jid"
							class="group inline-flex items-center font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
						>
							<span> Follow me @sh4jid </span>

							<ArrowRightIcon
								class="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1"
							/>
						</a>
					</div>
				</div>
			</div>
		</div>

		{#key page.url.pathname}
			<Giscus />
		{/key}
	</div>
</main>
