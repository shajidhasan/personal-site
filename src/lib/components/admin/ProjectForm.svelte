<script lang="ts">
	import { slugify } from '$lib/utilities';
	import { uploadViaAdminApi } from '$lib/admin/upload';
	import { toaster } from '$lib/services/toaster.svelte';

	import Button from '$lib/components/admin/ui/Button.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';

	import ZapIcon from '@lucide/svelte/icons/zap';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import ImageIcon from '@lucide/svelte/icons/image';

	interface Props {
		title: string;
		slug: string;
		description: string;
		url: string;
		iconUrl: string;
		isWip: boolean;
		sortOrder: number;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		slug = $bindable(''),
		description = $bindable(''),
		url = $bindable(''),
		iconUrl = $bindable(''),
		isWip = $bindable(false),
		sortOrder = $bindable(0),
		errors = {}
	}: Props = $props();

	let iconInput: HTMLInputElement | null = $state(null);
	let uploadingIcon = $state(false);

	async function onIconFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploadingIcon = true;
		try {
			const { url: uploadedUrl } = await uploadViaAdminApi(file);
			iconUrl = uploadedUrl;
			toaster.success('Icon uploaded.');
		} catch (err) {
			toaster.error(err instanceof Error ? err.message : 'Icon upload failed.');
		} finally {
			uploadingIcon = false;
		}
	}
</script>

<input
	bind:this={iconInput}
	type="file"
	accept="image/*"
	class="sr-only"
	onchange={onIconFileChange}
/>

<div class="space-y-4">
	<input type="hidden" name="iconUrl" value={iconUrl} />
	<input type="hidden" name="isWip" value={isWip ? 'true' : 'false'} />

	<div class="flex items-start gap-4">
		<div class="shrink-0">
			{#if iconUrl}
				<img src={iconUrl} alt="Project icon" class="size-16 rounded-lg object-cover" />
			{:else}
				<div
					class="flex size-16 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-600"
				>
					<ImageIcon class="h-6 w-6" />
				</div>
			{/if}
		</div>
		<div class="space-y-2 pt-1">
			<Button variant="secondary" loading={uploadingIcon} onclick={() => iconInput?.click()}>
				<UploadIcon class="h-4 w-4" />
				{iconUrl ? 'Replace icon' : 'Upload icon'}
			</Button>
			{#if iconUrl}
				<button
					type="button"
					onclick={() => (iconUrl = '')}
					class="block text-xs text-zinc-500 transition-colors hover:text-red-400"
				>
					Remove icon
				</button>
			{/if}
		</div>
	</div>

	<Field label="Title" forId="projectTitle" required error={errors.title}>
		<Input
			id="projectTitle"
			name="title"
			bind:value={title}
			invalid={!!errors.title}
			placeholder="My Project"
			onblur={() => {
				if (!slug.trim() && title.trim()) slug = slugify(title);
			}}
		/>
	</Field>

	<Field
		label="Slug"
		forId="projectSlug"
		required
		error={errors.slug}
		hint="Stable identifier; the icon key in R2 uses it."
	>
		<div class="flex gap-2">
			<Input
				id="projectSlug"
				name="slug"
				bind:value={slug}
				invalid={!!errors.slug}
				placeholder="my-project"
			/>
			<Button
				variant="secondary"
				title="Generate from title"
				onclick={() => (slug = slugify(title))}
			>
				<ZapIcon class="h-4 w-4" />
			</Button>
		</div>
	</Field>

	<Field label="Description" forId="projectDescription" required error={errors.description}>
		<Textarea
			id="projectDescription"
			name="description"
			bind:value={description}
			invalid={!!errors.description}
			rows={3}
			placeholder="One or two sentences about the project."
		/>
	</Field>

	<Field label="URL" forId="projectUrl" required error={errors.url}>
		<Input
			id="projectUrl"
			name="url"
			type="url"
			bind:value={url}
			invalid={!!errors.url}
			placeholder="https://example.com"
		/>
	</Field>

	<div class="grid grid-cols-2 gap-4">
		<Field
			label="Sort order"
			forId="projectSortOrder"
			hint="Lower shows first; home shows the first four."
		>
			<Input id="projectSortOrder" name="sortOrder" type="number" bind:value={sortOrder} />
		</Field>
		<div class="flex items-center gap-3 pt-7">
			<input
				type="checkbox"
				id="projectIsWip"
				bind:checked={isWip}
				class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
			/>
			<label for="projectIsWip" class="text-sm font-medium text-zinc-300">In progress</label>
		</div>
	</div>
</div>
