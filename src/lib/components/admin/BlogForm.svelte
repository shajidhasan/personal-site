<script lang="ts">
	import { generateRandomString } from '$lib/utilities';
	import { uploadViaAdminApi } from '$lib/admin/upload';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';
	import ZapIcon from '@lucide/svelte/icons/zap';

	interface Props {
		title: string;
		slug: string;
		content: string;
		excerpt?: string;
		tagsString: string;
		isPublished: boolean;
		publishedAt: string | null;
		featuredImageUrl?: string;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		slug = $bindable(''),
		content = $bindable(''),
		excerpt = $bindable(''),
		tagsString = $bindable(''),
		isPublished = $bindable(false),
		publishedAt = $bindable(null),
		featuredImageUrl = $bindable(''),
		errors = {}
	}: Props = $props();

	if (publishedAt == null) {
		publishedAt = new Date().toISOString().split('T')[0];
	}

	const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

	const slugError = $derived(
		errors.slug ??
			(slug && !SLUG_PATTERN.test(slug)
				? 'Use lowercase letters, numbers, and hyphens only'
				: undefined)
	);

	const generateRandomSlug = () => {
		slug = generateRandomString(8).toLowerCase();
	};

	const generateSlugFromTitle = () => {
		if (title.trim()) {
			slug = title
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-');
		}
	};
</script>

<div class="space-y-10">
	<!-- Basic Information -->
	<section class="space-y-5">
		<h2 class="text-lg font-medium text-zinc-100">Basic information</h2>

		<Field label="Title" forId="blogTitle" required error={errors.title}>
			<Input
				bind:value={title}
				id="blogTitle"
				required
				placeholder="Enter your post title"
				invalid={!!errors.title}
				onblur={generateSlugFromTitle}
			/>
		</Field>

		<Field label="URL Slug" forId="blogSlug" required error={slugError}>
			<div class="flex gap-2">
				<div class="min-w-0 flex-1">
					<Input
						bind:value={slug}
						id="blogSlug"
						required
						placeholder="url-friendly-slug"
						pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
						invalid={!!slugError}
					/>
				</div>
				<button
					type="button"
					onclick={generateRandomSlug}
					title="Generate random slug"
					aria-label="Generate random slug"
					class="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-400 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-200"
				>
					<ZapIcon class="h-4 w-4" />
				</button>
			</div>
		</Field>

		<Field label="Tags" forId="blogTags" hint="Separate multiple tags with commas">
			<Input bind:value={tagsString} id="blogTags" placeholder="svelte, webdev, tutorial" />
		</Field>
	</section>

	<!-- Publishing Settings -->
	<section class="space-y-5">
		<h2 class="text-lg font-medium text-zinc-100">Publishing</h2>

		<div class="grid items-center gap-5 md:grid-cols-2">
			<div class="flex items-center gap-3">
				<input
					bind:checked={isPublished}
					type="checkbox"
					id="blogIsPublished"
					class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
				/>
				<label for="blogIsPublished" class="text-sm font-medium text-zinc-300">
					Publish immediately
				</label>
			</div>

			<Field label="Publish Date" forId="blogPublishedAt">
				<Input bind:value={publishedAt} type="date" id="blogPublishedAt" />
			</Field>
		</div>
	</section>

	<!-- Content -->
	<section class="space-y-5">
		<h2 class="text-lg font-medium text-zinc-100">Content</h2>

		<Field label="Excerpt (Optional)" forId="blogExcerpt">
			<Textarea
				bind:value={excerpt}
				id="blogExcerpt"
				rows={3}
				placeholder="Brief summary of your post..."
			/>
		</Field>

		<Field label="Content" required error={errors.content}>
			<MarkdownEditor
				bind:value={content}
				placeholder="Write your post content in Markdown..."
				minHeight="26rem"
				onUploadImage={uploadViaAdminApi}
			/>
		</Field>
	</section>

	<!-- Optional Settings -->
	<section class="space-y-5">
		<h2 class="text-lg font-medium text-zinc-100">Optional settings</h2>

		<Field label="Featured Image URL" forId="blogFeaturedImage" error={errors.featuredImageUrl}>
			<Input
				bind:value={featuredImageUrl}
				type="url"
				id="blogFeaturedImage"
				placeholder="https://example.com/image.jpg"
			/>
		</Field>
	</section>
</div>
