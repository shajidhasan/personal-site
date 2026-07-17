<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: Snippet;
		action?: Snippet;
	}

	let { title, description, icon, action }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/40 px-6 py-16 text-center"
>
	{#if icon}
		<div class="mb-4 text-zinc-600">
			{@render icon()}
		</div>
	{/if}
	<h3 class="text-base font-medium text-zinc-200">{title}</h3>
	{#if description}
		<p class="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p>
	{/if}
	{#if action}
		<div class="mt-6">
			{@render action()}
		</div>
	{/if}
</div>
