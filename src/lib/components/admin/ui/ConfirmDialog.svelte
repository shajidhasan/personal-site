<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Button from './Button.svelte';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	interface Props {
		open?: boolean;
		title?: string;
		message: string;
		confirmLabel?: string;
		loading?: boolean;
		onconfirm: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		message,
		confirmLabel = 'Delete',
		loading = false,
		onconfirm
	}: Props = $props();
</script>

<Dialog bind:open {title}>
	<div class="flex items-start gap-3">
		<div class="rounded-full bg-red-500/10 p-2 text-red-400">
			<TriangleAlertIcon class="h-5 w-5" />
		</div>
		<p class="pt-1.5 text-sm leading-relaxed text-zinc-300">{message}</p>
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={() => (open = false)} disabled={loading}>Cancel</Button>
		<Button variant="danger" {loading} onclick={onconfirm}>{confirmLabel}</Button>
	{/snippet}
</Dialog>
