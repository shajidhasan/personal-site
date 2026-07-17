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

	let destinationUrl = $state('');
	let alias = $state('');
	let message = $state('');

	const form = createFormState();

	const snapshot = () => JSON.stringify({ destinationUrl, alias, message });

	let savedSnapshot = snapshot();
	useUnsavedGuard(() => snapshot() !== savedSnapshot);
</script>

<PageHeader title="Create shortlink" description="Create a new short link." />

<form
	method="POST"
	use:enhance={form.enhance({
		noReset: true,
		onSuccess: async (result) => {
			savedSnapshot = snapshot();
			const linkAlias = (result.data?.alias as string | undefined) ?? alias.trim();
			if (linkAlias) {
				try {
					await navigator.clipboard.writeText(`${window.location.origin}/l/${linkAlias}`);
					toaster.success('Shortlink created and link copied!');
				} catch {
					toaster.success('Shortlink created!');
				}
			} else {
				toaster.success('Shortlink created!');
			}
			await goto('/admin/url-shortener');
		}
	})}
>
	<LinkForm bind:destinationUrl bind:alias bind:message errors={form.errors} />

	<div
		class="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
	>
		<div class="flex items-center justify-end gap-3">
			<Button variant="ghost" href="/admin/url-shortener">Cancel</Button>
			<Button variant="primary" type="submit" loading={form.submitting}>
				<SaveIcon class="h-4 w-4" />
				Create link
			</Button>
		</div>
	</div>
</form>
