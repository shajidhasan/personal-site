<script lang="ts">
	import { generateRandomString } from '$lib/utilities';
	import CodeEditor from '$lib/components/admin/CodeEditor.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import ZapIcon from '@lucide/svelte/icons/zap';

	interface Props {
		title: string;
		alias: string;
		language: string;
		content: string;
		/** Hint shown under the alias field. */
		aliasHint?: string;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		alias = $bindable(''),
		language = $bindable('plaintext'),
		content = $bindable(''),
		aliasHint = 'Optional. Auto-generated if blank.',
		errors = {}
	}: Props = $props();

	const generateRandomAlias = () => {
		alias = generateRandomString(6);
	};
</script>

<div class="space-y-5">
	<Field label="Title" forId="pasteTitleInput" required error={errors.title}>
		<Input
			bind:value={title}
			id="pasteTitleInput"
			required
			placeholder="My Awesome Code Snippet"
			invalid={!!errors.title}
		/>
	</Field>

	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
		<Field label="Alias" forId="pasteAliasInput" error={errors.alias} hint={aliasHint}>
			<div class="flex gap-2">
				<div class="min-w-0 flex-1">
					<Input
						bind:value={alias}
						id="pasteAliasInput"
						placeholder="my-snippet"
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

		<Field label="Language" forId="pasteLanguageInput" required error={errors.language}>
			<Input bind:value={language} id="pasteLanguageInput" required placeholder="javascript" />
		</Field>
	</div>

	<Field label="Content" required error={errors.content}>
		<CodeEditor
			bind:value={content}
			{language}
			placeholder="Paste your code or text here..."
			minHeight="24rem"
		/>
	</Field>
</div>
