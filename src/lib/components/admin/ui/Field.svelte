<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		/** id of the control inside, for the label's `for`. */
		forId?: string;
		required?: boolean;
		error?: string;
		hint?: string;
		children: Snippet;
	}

	let { label, forId, required = false, error, hint, children }: Props = $props();
</script>

<div>
	<label for={forId} class="mb-1.5 block text-sm font-medium tracking-wide text-zinc-300">
		{label}
		{#if required}<span class="text-rose-400">*</span>{/if}
	</label>
	{@render children()}
	{#if error}
		<p class="mt-1.5 text-xs text-red-400">{error}</p>
	{:else if hint}
		<p class="mt-1.5 text-xs text-zinc-500">{hint}</p>
	{/if}
</div>
