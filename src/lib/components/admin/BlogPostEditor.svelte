<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { calculateReadTime, generateRandomString, slugify } from '$lib/utilities';
	import { uploadViaAdminApi } from '$lib/admin/upload';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';
	import ImagePicker from '$lib/components/admin/ui/ImagePicker.svelte';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import LockIcon from '@lucide/svelte/icons/lock';

	interface Props {
		mode: 'create' | 'edit';
		/** The loaded post row; required when mode === 'edit'. */
		initial?: {
			title: string;
			slug: string;
			content: string;
			excerpt: string | null;
			tags: string[] | null;
			isPublished: boolean;
			publishedAt: Date | string | null;
			featuredImageUrl: string | null;
			readTimeMinutes: number | null;
		};
	}

	let { mode, initial }: Props = $props();

	// Intentionally capture the loaded post once to seed the form.
	// svelte-ignore state_referenced_locally
	const post = initial;

	let title = $state(post?.title ?? '');
	let slug = $state(post?.slug ?? '');
	let content = $state(post?.content ?? '');
	let excerpt = $state(post?.excerpt ?? '');
	let tagsString = $state((post?.tags ?? []).join(', '));
	let isPublished = $state(post?.isPublished ?? false);

	// Normalized to YYYY-MM-DD up front so the pristine form compares clean
	// against the initial snapshot.
	let publishedAt = $state<string | null>(
		(post?.publishedAt ? new Date(post.publishedAt) : new Date()).toISOString().split('T')[0]
	);
	let featuredImageUrl = $state(post?.featuredImageUrl ?? '');

	let contentHtml = $state('');
	let readTimeMinutes = $state(post?.readTimeMinutes ?? 1);
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	// Once the slug has been edited by hand, stop regenerating it from the title.
	let slugTouched = $state(false);
	// In edit mode the slug is read-only until deliberately unlocked — changing
	// it re-points the post's public URL.
	// svelte-ignore state_referenced_locally
	let slugLocked = $state(mode === 'edit');

	const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

	const slugError = $derived(
		form.errors.slug ??
			(slug && !SLUG_PATTERN.test(slug)
				? 'Use lowercase letters, numbers, and hyphens only'
				: undefined)
	);

	const onTitleBlur = () => {
		if (mode === 'create' && !slugTouched && title.trim()) {
			slug = slugify(title);
		}
	};

	const onSlugInput = () => {
		// Clearing the slug re-enables auto-generation from the title.
		slugTouched = slug !== '';
	};

	const generateRandomSlug = () => {
		slug = generateRandomString(8).toLowerCase();
		slugTouched = true;
	};

	// Dirty check compares the current fields against the initial values
	// (re-snapshotted after a successful save).
	const snapshot = () =>
		JSON.stringify({
			title,
			slug,
			content,
			excerpt,
			tagsString,
			isPublished,
			publishedAt,
			featuredImageUrl
		});

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);

	const onSave = async () => {
		if (!title.trim() || !slug.trim() || !content.trim()) {
			toaster.error('Title, Slug, and Content are required.');
			return;
		}
		if (slug && !SLUG_PATTERN.test(slug)) {
			toaster.error('Slug format is invalid. Use lowercase alphanumeric and hyphens.');
			return;
		}

		rendering = true;

		try {
			// Content HTML must be rendered in the browser — the markdown pipeline
			// (marked + shiki) is far too heavy for the Worker bundle.
			contentHtml = await renderMarkdown(content);
			readTimeMinutes = calculateReadTime(content);
		} catch {
			toaster.error('Failed to render content. Please try again.');
			rendering = false;
			return;
		}

		await tick();
		formEl?.requestSubmit();
		rendering = false;
	};
</script>

{#snippet card(heading: string, body: import('svelte').Snippet)}
	<section class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
		<h3 class="mb-3 text-sm font-medium text-zinc-200">{heading}</h3>
		{@render body()}
	</section>
{/snippet}

<PageHeader
	title={mode === 'create' ? 'Create new post' : 'Edit post'}
	description={mode === 'create'
		? 'Write and publish a new blog post.'
		: 'Update your blog post content and settings.'}
/>

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success(
				mode === 'create' ? 'New blog post created!' : 'Blog post updated successfully!'
			);
			await goto('/admin/blog');
		}
	})}
>
	<input type="hidden" name="title" value={title} />
	<input type="hidden" name="slug" value={slug} />
	<input type="hidden" name="content" value={content} />
	<input type="hidden" name="contentHtml" value={contentHtml} />
	<input type="hidden" name="excerpt" value={excerpt} />
	<input type="hidden" name="tags" value={tagsString} />
	<input type="hidden" name="isPublished" value={isPublished ? 'true' : 'false'} />
	<input type="hidden" name="publishedAt" value={publishedAt ?? ''} />
	<input type="hidden" name="featuredImageUrl" value={featuredImageUrl} />
	<input type="hidden" name="readTimeMinutes" value={readTimeMinutes} />
</form>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
	<div class="min-w-0 space-y-6">
		<div>
			<label for="blogTitle" class="sr-only">Title</label>
			<input
				bind:value={title}
				id="blogTitle"
				type="text"
				required
				placeholder="Post title"
				onblur={onTitleBlur}
				class="block w-full border-0 border-b bg-transparent px-0 pb-3 text-2xl font-medium text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus:outline-none {form
					.errors.title
					? 'border-red-500'
					: 'border-zinc-800 focus:border-rose-500'}"
			/>
			{#if form.errors.title}
				<p class="mt-1.5 text-xs text-red-400">{form.errors.title}</p>
			{/if}
		</div>

		<Field label="Content" required error={form.errors.content}>
			<MarkdownEditor
				bind:value={content}
				placeholder="Write your post content in Markdown..."
				minHeight="32rem"
				onUploadImage={uploadViaAdminApi}
			/>
		</Field>

		<Field label="Excerpt (Optional)" forId="blogExcerpt">
			<Textarea
				bind:value={excerpt}
				id="blogExcerpt"
				rows={3}
				placeholder="Brief summary of your post..."
			/>
		</Field>
	</div>

	<aside class="space-y-4 lg:sticky lg:top-6">
		{#snippet publishBody()}
			<div class="space-y-4">
				<div class="flex items-center gap-3">
					<input
						bind:checked={isPublished}
						type="checkbox"
						id="blogIsPublished"
						class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
					/>
					<label for="blogIsPublished" class="text-sm font-medium text-zinc-300">Published</label>
				</div>
				<Field label="Publish date" forId="blogPublishedAt">
					<Input bind:value={publishedAt} type="date" id="blogPublishedAt" />
				</Field>
			</div>
		{/snippet}
		{@render card('Publish', publishBody)}

		{#snippet slugBody()}
			<div class="space-y-2">
				<div class="flex gap-2">
					<div class="min-w-0 flex-1 {slugLocked ? 'opacity-60' : ''}">
						<Input
							bind:value={slug}
							id="blogSlug"
							required
							placeholder="url-friendly-slug"
							pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
							invalid={!!slugError}
							readonly={slugLocked}
							oninput={onSlugInput}
						/>
					</div>
					{#if slugLocked}
						<button
							type="button"
							onclick={() => (slugLocked = false)}
							title="Unlock slug for editing"
							aria-label="Unlock slug for editing"
							class="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-400 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-200"
						>
							<LockIcon class="h-4 w-4" />
						</button>
					{:else}
						<button
							type="button"
							onclick={generateRandomSlug}
							title="Generate random slug"
							aria-label="Generate random slug"
							class="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-400 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-200"
						>
							<ZapIcon class="h-4 w-4" />
						</button>
					{/if}
				</div>
				{#if mode === 'edit' && !slugLocked}
					<p class="text-xs text-amber-400">
						Changing the slug breaks existing links to this post.
					</p>
				{/if}
				{#if slugError}
					<p class="text-xs text-red-400">{slugError}</p>
				{/if}
				<p class="truncate text-xs text-zinc-500">/blog/{slug || '…'}</p>
			</div>
		{/snippet}
		{@render card('Slug', slugBody)}

		{#snippet imageBody()}
			<div>
				<ImagePicker
					bind:value={featuredImageUrl}
					id="blogFeaturedImage"
					alt="Featured image preview"
					onUpload={uploadViaAdminApi}
				/>
				{#if form.errors.featuredImageUrl}
					<p class="mt-1.5 text-xs text-red-400">{form.errors.featuredImageUrl}</p>
				{/if}
			</div>
		{/snippet}
		{@render card('Featured image', imageBody)}

		{#snippet tagsBody()}
			<div class="space-y-1.5">
				<Input bind:value={tagsString} id="blogTags" placeholder="svelte, webdev, tutorial" />
				<p class="text-xs text-zinc-500">Separate with commas</p>
			</div>
		{/snippet}
		{@render card('Tags', tagsBody)}
	</aside>
</div>

<div
	class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
>
	<div class="flex items-center justify-end gap-3">
		<Button variant="ghost" href="/admin/blog">Cancel</Button>
		<Button variant="primary" loading={rendering || form.submitting} onclick={onSave}>
			<SaveIcon class="h-4 w-4" />
			{mode === 'create' ? 'Save post' : 'Update post'}
		</Button>
	</div>
</div>
