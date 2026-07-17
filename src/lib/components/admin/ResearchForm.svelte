<script lang="ts">
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';

	interface Props {
		title: string;
		authors: string;
		venue: string;
		year: number;
		abstract: string;
		doi: string;
		url: string;
		tags: string;
		isPublished: boolean;
		isFeatured: boolean;
		sortOrder: number;
		/** Server-side field errors (from a failed action), shown inline. */
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		authors = $bindable(''),
		venue = $bindable(''),
		year = $bindable(new Date().getFullYear()),
		abstract = $bindable(''),
		doi = $bindable(''),
		url = $bindable(''),
		tags = $bindable(''),
		isPublished = $bindable(true),
		isFeatured = $bindable(false),
		sortOrder = $bindable(0),
		errors = {}
	}: Props = $props();
</script>

<div class="space-y-4">
	<input type="hidden" name="isPublished" value={isPublished ? 'true' : 'false'} />
	<input type="hidden" name="isFeatured" value={isFeatured ? 'true' : 'false'} />

	<Field label="Title" forId="paperTitle" required error={errors.title}>
		<Input
			id="paperTitle"
			name="title"
			bind:value={title}
			invalid={!!errors.title}
			placeholder="Paper title"
		/>
	</Field>

	<Field
		label="Authors"
		forId="paperAuthors"
		required
		error={errors.authors}
		hint="One author per line, in order."
	>
		<Textarea
			id="paperAuthors"
			name="authors"
			bind:value={authors}
			invalid={!!errors.authors}
			rows={3}
			placeholder="Shajid Hasan Naim&#10;Co Author"
		/>
	</Field>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="sm:col-span-2">
			<Field label="Venue" forId="paperVenue" hint="Journal, conference, or “preprint”.">
				<Input id="paperVenue" name="venue" bind:value={venue} placeholder="Journal of ..." />
			</Field>
		</div>
		<Field label="Year" forId="paperYear" required error={errors.year}>
			<Input id="paperYear" name="year" type="number" bind:value={year} invalid={!!errors.year} />
		</Field>
	</div>

	<Field
		label="Link"
		forId="paperUrl"
		required
		error={errors.url}
		hint="DOI resolver or publisher page."
	>
		<Input
			id="paperUrl"
			name="url"
			type="url"
			bind:value={url}
			invalid={!!errors.url}
			placeholder="https://doi.org/10..."
		/>
	</Field>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<Field label="DOI" forId="paperDoi" hint="Bare DOI, optional.">
			<Input id="paperDoi" name="doi" bind:value={doi} placeholder="10.1234/abcd" />
		</Field>
		<Field label="Tags" forId="paperTags" hint="Comma-separated.">
			<Input id="paperTags" name="tags" bind:value={tags} placeholder="thermodynamics, ml" />
		</Field>
	</div>

	<Field
		label="Abstract"
		forId="paperAbstract"
		hint="Optional; shown collapsed on the public page."
	>
		<Textarea id="paperAbstract" name="abstract" bind:value={abstract} rows={4} />
	</Field>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<Field label="Sort order" forId="paperSortOrder" hint="Within the same year.">
			<Input id="paperSortOrder" name="sortOrder" type="number" bind:value={sortOrder} />
		</Field>
		<div class="flex items-center gap-3 pt-7">
			<input
				type="checkbox"
				id="paperPublished"
				bind:checked={isPublished}
				class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
			/>
			<label for="paperPublished" class="text-sm font-medium text-zinc-300">Published</label>
		</div>
		<div class="flex items-center gap-3 pt-7">
			<input
				type="checkbox"
				id="paperFeatured"
				bind:checked={isFeatured}
				class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
			/>
			<label for="paperFeatured" class="text-sm font-medium text-zinc-300">Feature on home</label>
		</div>
	</div>
</div>
