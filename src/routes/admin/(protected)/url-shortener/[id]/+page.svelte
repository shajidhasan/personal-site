<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toaster } from '$lib/services/toaster.svelte';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import LinkForm from '$lib/components/admin/LinkForm.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { data } = $props();

	// Intentionally capture the loaded shortlink once to seed the form.
	// svelte-ignore state_referenced_locally
	const link = data.shortLink;

	let destinationUrl = $state(link.destinationUrl);
	let alias = $state(link.alias);
	let message = $state(link.message || '');

	const form = createFormState();

	// Dirty check compares the current fields against the values loaded
	// from the server (re-snapshotted after a successful save).
	const snapshot = () => JSON.stringify({ destinationUrl, alias, message });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);
</script>

<PageHeader title="Edit shortlink" description={`/l/${link.alias}`} />

<form
	method="POST"
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async () => {
			savedSnapshot = snapshot();
			toaster.success('Shortlink updated successfully!');
			await goto('/admin/url-shortener');
		}
	})}
>
	<LinkForm
		bind:destinationUrl
		bind:alias
		bind:message
		aliasHint="Changing this will update the short URL."
		errors={form.errors}
	/>

	<div
		class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
	>
		<div class="flex items-center justify-end gap-3">
			<Button variant="ghost" href="/admin/url-shortener">Cancel</Button>
			<Button variant="primary" type="submit" loading={form.submitting}>
				<SaveIcon class="h-4 w-4" />
				Save changes
			</Button>
		</div>
	</div>
</form>
