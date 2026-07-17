<script lang="ts">
	import { toaster } from '$lib/services/toaster.svelte';
	import { fly } from 'svelte/transition';
</script>

<div class="pointer-events-none fixed right-4 bottom-20 z-50">
	{#if toaster.show}
		<div
			transition:fly={{ y: 100 }}
			class="card pointer-events-auto max-w-sm {toaster.type === 'success'
				? 'border-green-700 bg-green-900'
				: 'border-red-700 bg-red-900'}"
			role="alert"
		>
			<div class="flex items-start gap-2">
				<span class="flex-shrink-0">
					{#if toaster.type === 'error'}
						✕
					{:else}
						✓
					{/if}
				</span>
				<div class="flex-1">
					<p class="text-sm font-medium">{toaster.message}</p>
				</div>
			</div>
		</div>
	{/if}
</div>
