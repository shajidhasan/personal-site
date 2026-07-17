<script lang="ts">
	import Input from '$lib/components/admin/ui/Input.svelte';
	import ImageIcon from '@lucide/svelte/icons/image';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	interface Props {
		/** The image URL; empty string means no image. */
		value?: string;
		/** id for the URL input, for an outer Field's forId. */
		id?: string;
		alt?: string;
		onUpload: (file: File) => Promise<{ url: string }>;
		maxSizeMb?: number;
	}

	let {
		value = $bindable(''),
		id,
		alt = 'Image preview',
		onUpload,
		maxSizeMb = 10
	}: Props = $props();

	let uploading = $state(false);
	let dragOver = $state(false);
	let uploadError = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	const handleFile = async (file: File | undefined) => {
		if (!file || uploading) return;

		uploadError = '';

		if (!file.type.startsWith('image/')) {
			uploadError = 'Only image files are allowed.';
			return;
		}
		if (file.size > maxSizeMb * 1024 * 1024) {
			uploadError = `Image must be smaller than ${maxSizeMb}MB.`;
			return;
		}

		uploading = true;
		try {
			const { url } = await onUpload(file);
			value = url;
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Upload failed. Please try again.';
		} finally {
			uploading = false;
		}
	};

	const onFileChange = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		await handleFile(input.files?.[0]);
		// Allow re-picking the same file.
		input.value = '';
	};

	const onDrop = async (event: DragEvent) => {
		dragOver = false;
		await handleFile(event.dataTransfer?.files[0]);
	};
</script>

<div class="space-y-2">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="sr-only"
		aria-hidden="true"
		tabindex="-1"
		onchange={onFileChange}
	/>

	{#if value}
		<div
			role="button"
			tabindex="0"
			aria-label="Replace image"
			class="group relative block w-full cursor-pointer overflow-hidden rounded-md border border-zinc-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none {uploading
				? 'pointer-events-none'
				: ''}"
			onclick={() => fileInput?.click()}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					fileInput?.click();
				}
			}}
			ondragover={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragleave={() => (dragOver = false)}
			ondrop={(e) => {
				e.preventDefault();
				onDrop(e);
			}}
		>
			<img src={value} {alt} class="aspect-video w-full object-cover" />
			<div
				class="absolute inset-0 flex items-center justify-center bg-zinc-950/70 transition-opacity duration-150 {uploading ||
				dragOver
					? 'opacity-100'
					: 'opacity-0 group-hover:opacity-100'}"
			>
				{#if uploading}
					<LoaderCircleIcon class="h-5 w-5 animate-spin text-zinc-200" />
				{:else}
					<span class="text-xs font-medium text-zinc-200">Replace image</span>
				{/if}
			</div>
		</div>
		<button
			type="button"
			class="text-xs font-medium text-zinc-400 transition-colors duration-150 hover:text-red-400"
			onclick={() => {
				value = '';
				uploadError = '';
			}}
		>
			Remove image
		</button>
	{:else}
		<button
			type="button"
			disabled={uploading}
			class="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-3 text-center transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none disabled:pointer-events-none {dragOver
				? 'border-rose-500/60 bg-zinc-800/50'
				: 'border-zinc-700 hover:border-rose-500/60 hover:bg-zinc-800/50'}"
			onclick={() => fileInput?.click()}
			ondragover={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragleave={() => (dragOver = false)}
			ondrop={(e) => {
				e.preventDefault();
				onDrop(e);
			}}
		>
			{#if uploading}
				<LoaderCircleIcon class="h-5 w-5 animate-spin text-zinc-400" />
				<span class="text-xs text-zinc-400">Uploading…</span>
			{:else}
				<ImageIcon class="h-5 w-5 text-zinc-500" />
				<span class="text-xs text-zinc-400">
					Drop an image or <span class="font-medium text-rose-400">browse</span>
				</span>
			{/if}
		</button>
	{/if}

	{#if uploadError}
		<p class="text-xs text-red-400">{uploadError}</p>
	{/if}

	<Input
		bind:value
		{id}
		type="url"
		placeholder="…or paste an image URL"
		oninput={() => (uploadError = '')}
	/>
</div>
