<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		loading?: boolean;
		/** Renders an <a> styled as a button instead. */
		href?: string;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		loading = false,
		href,
		type = 'button',
		disabled,
		children,
		...rest
	}: Props = $props();

	const variants = {
		primary:
			'border-rose-600 bg-gradient-to-r from-rose-500 to-rose-600 font-semibold text-white hover:from-rose-600 hover:to-rose-700 active:from-rose-700 active:to-rose-800',
		secondary:
			'border-zinc-700 bg-zinc-800 font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700',
		danger:
			'border-red-700 bg-red-700/90 font-semibold text-white hover:bg-red-700 active:bg-red-800',
		ghost:
			'border-transparent bg-transparent font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
	};

	const classes = $derived(
		`relative inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`
	);
</script>

{#if href}
	<a {href} class={classes} {...rest as object}>
		{@render children()}
	</a>
{:else}
	<button {type} class={classes} disabled={disabled || loading} {...rest}>
		<!-- Spinner overlays invisible content so the button never changes size -->
		<span class="inline-flex items-center gap-2 {loading ? 'invisible' : ''}">
			{@render children()}
		</span>
		{#if loading}
			<span class="absolute inset-0 flex items-center justify-center">
				<LoaderCircleIcon class="h-4 w-4 animate-spin" />
			</span>
		{/if}
	</button>
{/if}
