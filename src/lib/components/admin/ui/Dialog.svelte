<script lang="ts">
	import type { Snippet } from 'svelte';
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		open?: boolean;
		title: string;
		/** Small mono subtitle under the title (e.g. the entity's URL). */
		subtitle?: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { open = $bindable(false), title, subtitle, children, footer }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) dialogEl.showModal();
		else if (!open && dialogEl.open) dialogEl.close();
	});
</script>

<dialog
	bind:this={dialogEl}
	onclose={() => (open = false)}
	class="dialog fixed top-1/2 left-1/2 m-0 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-700 bg-zinc-800 p-0 text-zinc-200 shadow-xl backdrop:bg-zinc-950/70 backdrop:backdrop-blur-sm"
>
	{#if open}
		<div class="flex items-start justify-between gap-4 border-b border-zinc-700/70 px-6 py-4">
			<div class="min-w-0">
				<h2 class="text-lg font-medium text-zinc-100">{title}</h2>
				{#if subtitle}
					<p class="mt-0.5 truncate font-mono text-xs text-zinc-400">{subtitle}</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (open = false)}
				aria-label="Close dialog"
				class="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
			>
				<XIcon class="h-4 w-4" />
			</button>
		</div>

		<div class="max-h-[70vh] overflow-y-auto px-6 py-5">
			{@render children()}
		</div>

		{#if footer}
			<div
				class="flex flex-col-reverse gap-3 border-t border-zinc-700/70 px-6 py-4 sm:flex-row sm:justify-end"
			>
				{@render footer()}
			</div>
		{/if}
	{/if}
</dialog>
