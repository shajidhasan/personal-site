<script lang="ts">
	import { generateRandomString } from '$lib/utilities';
	import { uploadViaAdminApi } from '$lib/admin/upload';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import ZapIcon from '@lucide/svelte/icons/zap';

	interface Props {
		title: string;
		alias: string;
		content: string;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		alias = $bindable(''),
		content = $bindable(''),
		errors = {}
	}: Props = $props();

	const generateRandomAlias = () => {
		alias = generateRandomString(8).toLowerCase();
	};
</script>

<div class="space-y-8">
	<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
		<div class="md:col-span-2">
			<Field label="Title" forId="titleInput" required error={errors.title}>
				<Input
					bind:value={title}
					id="titleInput"
					required
					placeholder="Note title..."
					invalid={!!errors.title}
				/>
			</Field>
		</div>

		<Field
			label="Alias"
			forId="aliasInput"
			error={errors.alias}
			hint="Optional. 3+ chars: alphanumeric, underscore, hyphen."
		>
			<div class="flex gap-2">
				<div class="min-w-0 flex-1">
					<Input
						bind:value={alias}
						id="aliasInput"
						placeholder="custom-alias"
						pattern={'^[a-zA-Z0-9_-]{3,}$'}
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
	</div>

	<Field label="Content" error={errors.content}>
		<MarkdownEditor
			bind:value={content}
			placeholder="Write your note content in Markdown..."
			minHeight="26rem"
			onUploadImage={uploadViaAdminApi}
		/>
	</Field>
</div>
