<script lang="ts">
	import type { BlogPost } from '$lib/types';
	import { formatDate } from '$lib/utilities';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { blogPosts }: { blogPosts: BlogPost[] } = $props();
</script>

<!-- Compact list on the home page — the full cards live on /blog -->
<section id="blog" class="py-16 dark:bg-transparent">
	<div class="mx-auto max-w-4xl px-6">
		<h2 data-fade-in class="mb-8 text-3xl font-light text-gray-900 dark:text-gray-100">
			Latest Posts
		</h2>
		<div class="divide-y divide-gray-200 dark:divide-gray-700/60">
			{#each blogPosts as post (post.id)}
				<a href="/blog/{post.slug}" class="group block py-5 first:pt-0 last:pb-0">
					<div
						class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
					>
						<h3
							class="font-medium text-gray-900 transition-colors duration-300 group-hover:text-rose-600 dark:text-gray-100 dark:group-hover:text-rose-400"
						>
							{post.title}
						</h3>
						<span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">
							{formatDate(post.publishedAt)} · {post.readTimeMinutes} min read
						</span>
					</div>
					<p class="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
						{post.excerpt}
					</p>
				</a>
			{/each}
		</div>

		<div class="mt-10 text-center">
			<a
				href="/blog"
				class="group inline-flex items-center text-gray-600 transition-colors duration-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
			>
				View all posts
				<ArrowRightIcon
					class="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1"
				/>
			</a>
		</div>
	</div>
</section>
