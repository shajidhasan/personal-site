<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import ProjectForm from '$lib/components/admin/ProjectForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { data } = $props();

	let title = $state('');
	let slug = $state('');
	let description = $state('');
	let url = $state('');
	let iconUrl = $state('');
	let isWip = $state(false);
	// Intentionally capture the loaded count once to seed the default sort order.
	// svelte-ignore state_referenced_locally
	let sortOrder = $state(data.projectCount);

	const form = createFormState();

	const snapshot = () =>
		JSON.stringify({ title, slug, description, url, iconUrl, isWip, sortOrder });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);
</script>

<PageHeader title="New project" description="Add a project to the home page and /projects." />

<form
	method="POST"
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Project created.');
			await goto('/admin/projects');
		}
	})}
>
	<ProjectForm
		bind:title
		bind:slug
		bind:description
		bind:url
		bind:iconUrl
		bind:isWip
		bind:sortOrder
		errors={form.errors}
	/>

	<div
		class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
	>
		<div class="flex items-center justify-end gap-3">
			<Button variant="ghost" href="/admin/projects">Cancel</Button>
			<Button variant="primary" type="submit" loading={form.submitting}>
				<SaveIcon class="h-4 w-4" />
				Create project
			</Button>
		</div>
	</div>
</form>
