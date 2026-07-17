<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<div class="mb-8 flex flex-wrap items-start justify-between gap-4">
	<div class="min-w-0">
		<h1 class="text-2xl font-medium tracking-tight text-zinc-100">{title}</h1>
		{#if description}
			<p class="mt-1 text-sm text-zinc-400">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 flex-wrap items-center gap-3">
			{@render actions()}
		</div>
	{/if}
</div>
