<script lang="ts">
	import { generateRandomString } from '$lib/utilities';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';
	import ZapIcon from '@lucide/svelte/icons/zap';

	interface Props {
		destinationUrl: string;
		alias: string;
		message: string;
		/** Hint shown under the alias field. */
		aliasHint?: string;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		destinationUrl = $bindable(''),
		alias = $bindable(''),
		message = $bindable(''),
		aliasHint = 'Optional. Auto-generated if blank.',
		errors = {}
	}: Props = $props();

	const generateRandomAlias = () => {
		alias = generateRandomString(4);
	};
</script>

<div class="space-y-5">
	<Field
		label="Destination URL"
		forId="linkDestinationInput"
		required
		error={errors.destinationUrl}
	>
		<Input
			bind:value={destinationUrl}
			type="url"
			id="linkDestinationInput"
			name="destinationUrl"
			required
			placeholder="https://example.com/very/long/url"
			invalid={!!errors.destinationUrl}
		/>
	</Field>

	<Field label="Alias" forId="linkAliasInput" error={errors.alias} hint={aliasHint}>
		<div class="flex gap-2">
			<div class="min-w-0 flex-1">
				<Input
					bind:value={alias}
					id="linkAliasInput"
					name="alias"
					placeholder="my-link"
					pattern={'^[a-zA-Z0-9_-]{3,}$'}
					title="3+ chars: alphanumeric, underscore, hyphen"
					invalid={!!errors.alias}
				/>
			</div>
			<button
				type="button"
				onclick={generateRandomAlias}
				title="Generate random alias"
				aria-label="Generate random alias"
				class="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-zinc-400 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-200"
			>
				<ZapIcon class="h-4 w-4" />
			</button>
		</div>
	</Field>

	<Field
		label="Message"
		forId="linkMessageInput"
		error={errors.message}
		hint="Optional message shown before redirect."
	>
		<Textarea
			bind:value={message}
			id="linkMessageInput"
			name="message"
			rows={2}
			placeholder="Optional message shown before redirect"
		/>
	</Field>
</div>
