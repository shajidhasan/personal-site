<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	import Button from '$lib/components/admin/ui/Button.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';

	let { data, form } = $props();

	// Seeded once from ?user_code= on purpose: the field is user-editable afterwards,
	// so it must not track `data`.
	// svelte-ignore state_referenced_locally
	let userCode = $state(data.presetCode);
	let loading = $state(false);

	const errorMessage = $derived(form?.success ? '' : (form?.message ?? ''));

	const submit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Authorise a device</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-200">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<p class="text-2xl font-semibold tracking-wider text-zinc-100">sh4jid</p>
			<p class="mt-2 text-sm text-zinc-400">Authorise a device</p>
		</div>

		{#if form?.success}
			<div class="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center shadow-xl sm:p-8">
				<p class="text-sm text-zinc-300">{form.message}</p>
				<p class="mt-4 text-xs text-zinc-500">You can close this tab.</p>
			</div>
		{:else}
			<form
				method="POST"
				use:enhance={submit}
				class="space-y-5 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8"
			>
				<p class="flex items-start gap-2 text-sm text-zinc-400">
					<TerminalIcon class="mt-0.5 h-4 w-4 shrink-0" />
					<span>Confirm this matches the code your terminal is showing.</span>
				</p>

				<Field label="Device code" forId="device-code" required error={errorMessage}>
					<!-- Plain input rather than the shared Input: this field wants centred, spaced,
					     uppercase monospace, which would mean overriding that component's whole class. -->
					<input
						id="device-code"
						bind:value={userCode}
						name="userCode"
						placeholder="XXXXXXXX"
						autocomplete="off"
						autocapitalize="characters"
						spellcheck="false"
						disabled={loading}
						class="block w-full rounded-md border bg-zinc-800 px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-zinc-100 uppercase placeholder:tracking-normal placeholder:text-zinc-600 focus:ring-2 focus:outline-none {errorMessage
							? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
							: 'border-zinc-700 focus:border-rose-500 focus:ring-rose-500/50'}"
					/>
				</Field>

				<div class="grid grid-cols-2 gap-3 pt-1">
					<Button type="submit" formaction="?/deny" variant="secondary" disabled={loading}>
						<XIcon class="h-4 w-4" />
						Deny
					</Button>
					<Button type="submit" formaction="?/approve" variant="primary" {loading}>
						<CheckIcon class="h-4 w-4" />
						Approve
					</Button>
				</div>
			</form>
		{/if}
	</div>
</div>
