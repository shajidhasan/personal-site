<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		value?: unknown;
		invalid?: boolean;
		children: Snippet;
	}

	let { value = $bindable(''), invalid = false, children, ...rest }: Props = $props();
</script>

<select
	bind:value
	class="block w-full rounded-md border bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:ring-2 focus:outline-none {invalid
		? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
		: 'border-zinc-700 focus:border-rose-500 focus:ring-rose-500/50'}"
	{...rest}
>
	{@render children()}
</select>
