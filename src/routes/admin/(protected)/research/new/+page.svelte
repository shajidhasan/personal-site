<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ResearchForm from '$lib/components/admin/ResearchForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let title = $state('');
	let authors = $state('');
	let venue = $state('');
	let year = $state(new Date().getFullYear());
	let abstract = $state('');
	let doi = $state('');
	let url = $state('');
	let tags = $state('');
	let isPublished = $state(true);
	let isFeatured = $state(false);
	let sortOrder = $state(0);

	const form = createFormState();

	const snapshot = () =>
		JSON.stringify({
			title,
			authors,
			venue,
			year,
			abstract,
			doi,
			url,
			tags,
			isPublished,
			isFeatured,
			sortOrder
		});

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);
</script>

<PageHeader title="New paper" description="Add a publication to the research list." />

<form
	method="POST"
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Paper added.');
			await goto('/admin/research');
		}
	})}
>
	<ResearchForm
		bind:title
		bind:authors
		bind:venue
		bind:year
		bind:abstract
		bind:doi
		bind:url
		bind:tags
		bind:isPublished
		bind:isFeatured
		bind:sortOrder
		errors={form.errors}
	/>

	<div
		class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
	>
		<div class="flex items-center justify-end gap-3">
			<Button variant="ghost" href="/admin/research">Cancel</Button>
			<Button variant="primary" type="submit" loading={form.submitting}>
				<SaveIcon class="h-4 w-4" />
				Add paper
			</Button>
		</div>
	</div>
</form>
