<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { calculateReadTime } from '$lib/utilities';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import BlogForm from '$lib/components/admin/BlogForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { data } = $props();

	// Intentionally capture the loaded post once to seed the form.
	// svelte-ignore state_referenced_locally
	const blogPost = data.blogPost;

	let title = $state(blogPost.title || '');
	let slug = $state(blogPost.slug || '');
	let content = $state(blogPost.content || '');
	let excerpt = $state(blogPost.excerpt || '');
	let tagsString = $state((blogPost.tags || []).join(', '));
	let isPublished = $state(blogPost.isPublished || false);

	// Normalized the same way BlogForm defaults a missing date, so the
	// pristine form compares clean against the server-loaded snapshot.
	let publishedAt = $state<string | null>(
		(blogPost.publishedAt ? new Date(blogPost.publishedAt) : new Date()).toISOString().split('T')[0]
	);
	let featuredImageUrl = $state(blogPost.featuredImageUrl || '');

	let contentHtml = $state('');
	let readTimeMinutes = $state(blogPost.readTimeMinutes || 1);
	let rendering = $state(false);

	let formEl: HTMLFormElement | undefined = $state();

	const form = createFormState();

	// Dirty check compares the current fields against the values loaded
	// from the server (re-snapshotted after a successful save).
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

	const onUpdateBlogPost = async () => {
		if (!title.trim() || !slug.trim() || !content.trim()) {
			toaster.error('Title, Slug, and Content are required.');
			return;
		}
		if (slug && !slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
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

<PageHeader title="Edit post" description="Update your blog post content and settings." />

<form
	method="POST"
	bind:this={formEl}
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Blog post updated successfully!');
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

<BlogForm
	bind:title
	bind:slug
	bind:content
	bind:excerpt
	bind:tagsString
	bind:isPublished
	bind:publishedAt
	bind:featuredImageUrl
	errors={form.errors}
/>

<div
	class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
>
	<div class="flex items-center justify-end gap-3">
		<Button variant="ghost" href="/admin/blog">Cancel</Button>
		<Button variant="primary" loading={rendering || form.submitting} onclick={onUpdateBlogPost}>
			<SaveIcon class="h-4 w-4" />
			Update post
		</Button>
	</div>
</div>
