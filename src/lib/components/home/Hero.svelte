<script lang="ts">
	import { SOCIAL_PLATFORMS } from '$lib/components/shared/social-icons';
	import type { SiteSettings } from '$lib/types';
	import sh4jid from '$lib/assets/sh4jid.jpg';

	let { settings }: { settings: SiteSettings } = $props();
</script>

<section id="about" class="min-h-[50vh] py-16 pt-32">
	<div class="mx-auto max-w-4xl px-6">
		<div
			class="flex flex-col gap-8 md:flex-row-reverse md:items-start md:justify-between md:gap-12"
		>
			<img
				src={settings.identity.avatarUrl ?? sh4jid}
				alt={settings.identity.fullName}
				class="size-28 shrink-0 self-start rounded-full object-cover object-top ring-2 ring-gray-200 md:mt-2 md:size-40 dark:ring-gray-700"
			/>
			<div class="max-w-2xl">
				<h1 class="mb-6 text-3xl font-light text-gray-900 md:text-5xl dark:text-gray-50">
					hello, i'm
					<span class="font-medium text-gray-900 dark:text-gray-50"
						>{settings.identity.headline}</span
					>
				</h1>
				<div class="bio mb-8 space-y-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored, rendered at save time -->
					{@html settings.bio.html}
				</div>

				<div class="flex gap-6">
					{#each settings.socialLinks as link (link.platform + link.url)}
						{@const meta = SOCIAL_PLATFORMS[link.platform]}
						{#if meta}
							<a
								href={link.url}
								class="text-gray-500 transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
								aria-label={link.label ?? `${settings.identity.fullName} on ${meta.label}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<meta.icon />
							</a>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
