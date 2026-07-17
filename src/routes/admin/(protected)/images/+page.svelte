<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import SearchIcon from '@lucide/svelte/icons/search';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ImageIcon from '@lucide/svelte/icons/image';
	import FileArchiveIcon from '@lucide/svelte/icons/file-archive';
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import EmptyState from '$lib/components/admin/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/admin/ui/ConfirmDialog.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { toaster } from '$lib/services/toaster.svelte';
	import { formatTimestamp } from '$lib/utilities';

	interface StoredImage {
		key: string;
		size: number;
		uploaded: string;
	}

	let { data } = $props();

	let searchTerm = $state('');
	const images = $derived(data.images);

	const uploadForm = createFormState();
	const deleteForm = createFormState();

	let fileInputEl: HTMLInputElement | undefined = $state();
	let uploadFormEl: HTMLFormElement | undefined = $state();
	let deleteFormEl: HTMLFormElement | undefined = $state();

	let deleteDialogOpen = $state(false);
	let imageToDelete: StoredImage | null = $state(null);
	let dragActive = $state(false);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	// The uploaded key is `uploads/<yyyy>/<mm>/<uuid>-<original name>` — show the original name.
	const imageName = (key: string): string => {
		const basename = key.split('/').pop() ?? key;
		return basename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '');
	};

	const openFileUploadDialog = () => {
		if (uploadForm.submitting) return;
		fileInputEl?.click();
	};

	const validateFile = (file: File): boolean => {
		if (!file.type.startsWith('image/')) {
			toaster.error('Invalid file type. Please upload an image.');
			return false;
		}
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			toaster.error(`File is too large. Max size is ${formatFileSize(maxSize)}.`);
			return false;
		}
		return true;
	};

	const handleFileSelected = () => {
		const file = fileInputEl?.files?.[0];
		if (!file) return;

		if (!validateFile(file)) {
			if (fileInputEl) fileInputEl.value = '';
			return;
		}

		uploadFormEl?.requestSubmit();
	};

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
		dragActive = true;
	};

	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		dragActive = false;
		if (uploadForm.submitting || !fileInputEl) return;

		const file = event.dataTransfer?.files?.[0];
		if (!file) return;

		// Feed the dropped file through the same hidden form flow.
		const transfer = new DataTransfer();
		transfer.items.add(file);
		fileInputEl.files = transfer.files;
		handleFileSelected();
	};

	const openDeleteDialog = (image: StoredImage) => {
		imageToDelete = image;
		deleteDialogOpen = true;
	};

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toaster.success(`${type} copied to clipboard!`);
		} catch {
			toaster.error(`Failed to copy ${type}.`);
		}
	};

	const copyImageUrl = (image: StoredImage) => {
		const url = `${window.location.origin}/images/${image.key}`;
		copyToClipboard(url, 'Image URL');
	};

	const filteredImages = $derived.by(() => {
		if (!searchTerm.trim()) return images;
		const lowerSearchTerm = searchTerm.toLowerCase();
		return images.filter((image) => image.key.toLowerCase().includes(lowerSearchTerm));
	});
</script>

<form
	method="POST"
	action="?/upload"
	enctype="multipart/form-data"
	bind:this={uploadFormEl}
	use:enhance={uploadForm.enhance({ successMessage: 'Image uploaded successfully!' })}
	class="hidden"
>
	<input
		type="file"
		name="file"
		bind:this={fileInputEl}
		onchange={handleFileSelected}
		accept="image/*"
		disabled={uploadForm.submitting}
	/>
</form>

<form
	method="POST"
	action="?/delete"
	bind:this={deleteFormEl}
	use:enhance={deleteForm.enhance({
		onSuccess: () => {
			const name = imageToDelete ? imageName(imageToDelete.key) : 'Image';
			toaster.success(`${name} deleted successfully!`);
			deleteDialogOpen = false;
			imageToDelete = null;
		}
	})}
	class="hidden"
>
	<input type="hidden" name="key" value={imageToDelete?.key ?? ''} />
</form>

<PageHeader title="Images" description="Upload and manage images served from /images.">
	{#snippet actions()}
		<Button variant="primary" loading={uploadForm.submitting} onclick={openFileUploadDialog}>
			<UploadIcon class="h-4 w-4" />
			Upload image
		</Button>
	{/snippet}
</PageHeader>

{#if images.length > 0}
	<div class="relative mb-6 sm:max-w-md">
		<input
			type="search"
			bind:value={searchTerm}
			placeholder="Search images..."
			class="block w-full rounded-md border border-zinc-700 bg-zinc-800 py-2.5 pr-3.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
		/>
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			<SearchIcon class="h-4 w-4 text-zinc-500" />
		</div>
	</div>
{/if}

<div
	role="region"
	aria-label="Image library — drop an image here to upload"
	ondragover={handleDragOver}
	ondragleave={() => (dragActive = false)}
	ondrop={handleDrop}
	class="rounded-lg transition-shadow {dragActive
		? 'ring-2 ring-rose-500/70 ring-offset-4 ring-offset-zinc-900'
		: ''}"
>
	{#if images.length === 0}
		<EmptyState
			title="No images yet"
			description="Upload your first image, or drag and drop one anywhere on this area."
		>
			{#snippet icon()}
				<ImageIcon class="h-10 w-10" stroke-width="1.5" />
			{/snippet}
			{#snippet action()}
				<Button variant="primary" loading={uploadForm.submitting} onclick={openFileUploadDialog}>
					<UploadIcon class="h-4 w-4" />
					Upload image
				</Button>
			{/snippet}
		</EmptyState>
	{:else if filteredImages.length === 0}
		<EmptyState
			title="No matching images"
			description={`No images matched your search for "${searchTerm}".`}
		>
			{#snippet icon()}
				<SearchIcon class="h-10 w-10" stroke-width="1.5" />
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredImages as image, i (image.key)}
				<div
					animate:flip={{ duration: 250, delay: i * 20 }}
					in:fly|global={{ delay: i * 50, y: 20, duration: 200 }}
					class="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900/80"
				>
					<div class="relative aspect-[4/3] overflow-hidden bg-zinc-800">
						<img
							class="h-full w-full object-cover transition-transform duration-300"
							src={`/images/${image.key}`}
							alt={`Preview of ${imageName(image.key)}`}
							loading="lazy"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						>
							<div class="absolute right-3 bottom-3 left-3">
								<h3
									class="truncate text-xs font-medium text-white drop-shadow-md"
									title={imageName(image.key)}
								>
									{imageName(image.key)}
								</h3>
							</div>
						</div>
					</div>

					<div class="p-4">
						<div class="mb-3 space-y-1.5 text-xs">
							<div class="flex items-center text-zinc-500">
								<FileArchiveIcon class="mr-1.5 h-3 w-3" />
								{formatFileSize(image.size)}
							</div>
							<div class="flex items-center text-zinc-500">
								<CalendarClockIcon class="mr-1.5 h-3 w-3" />
								{formatTimestamp(image.uploaded)}
							</div>
						</div>

						<div class="flex items-center justify-center space-x-2 border-t border-zinc-800 pt-3">
							<button
								type="button"
								onclick={() => copyImageUrl(image)}
								class="inline-flex items-center space-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-200"
							>
								<CopyIcon class="h-3.5 w-3.5" />
								<span>Copy URL</span>
							</button>
							<button
								type="button"
								onclick={() => openDeleteDialog(image)}
								class="inline-flex items-center space-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
							>
								<Trash2Icon class="h-3.5 w-3.5" />
								<span>Delete</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Delete image"
	message={`Are you sure you want to delete "${imageToDelete ? imageName(imageToDelete.key) : ''}"? This action cannot be undone.`}
	confirmLabel="Delete image"
	loading={deleteForm.submitting}
	onconfirm={() => deleteFormEl?.requestSubmit()}
/>
