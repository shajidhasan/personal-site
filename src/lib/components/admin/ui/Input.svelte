<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: unknown;
		invalid?: boolean;
	}

	let { value = $bindable(''), invalid = false, type = 'text', ...rest }: Props = $props();
</script>

<input
	bind:value
	{type}
	class="block w-full rounded-md border bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:outline-none {invalid
		? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
		: 'border-zinc-700 focus:border-rose-500 focus:ring-rose-500/50'}"
	{...rest}
/>
