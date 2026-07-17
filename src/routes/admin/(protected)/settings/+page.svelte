<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { renderMarkdown } from '$lib/markdown';
	import { uploadViaAdminApi } from '$lib/admin/upload';
	import { createFormState } from '$lib/admin/forms.svelte';
	import { useUnsavedGuard } from '$lib/admin/unsaved.svelte';
	import { toaster } from '$lib/services/toaster.svelte';
	import { SOCIAL_PLATFORMS } from '$lib/components/shared/social-icons';
	import type { SocialPlatform } from '$lib/types';

	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';
	import Textarea from '$lib/components/admin/ui/Textarea.svelte';
	import Select from '$lib/components/admin/ui/Select.svelte';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';

	import UploadIcon from '@lucide/svelte/icons/upload';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import UserIcon from '@lucide/svelte/icons/user';

	let { data } = $props();

	// Form drafts are intentionally seeded once from the loaded settings —
	// untrack() keeps svelte from warning about capturing the initial value.
	const initial = untrack(() => data.settings);

	// ── Identity ────────────────────────────────────────────────────────────
	const identityForm = createFormState();
	let fullName = $state(initial.identity.fullName);
	let shortName = $state(initial.identity.shortName);
	let headline = $state(initial.identity.headline);
	let avatarUrl = $state(initial.identity.avatarUrl ?? '');
	let avatarInput: HTMLInputElement | null = $state(null);
	let uploadingAvatar = $state(false);

	// ── Bio ─────────────────────────────────────────────────────────────────
	const bioForm = createFormState();
	let bioFormEl: HTMLFormElement | undefined = $state();
	let bioMarkdown = $state(initial.bio.markdown);
	let bioHtml = $state(initial.bio.html);
	let renderingBio = $state(false);

	// ── Social links ────────────────────────────────────────────────────────
	const socialForm = createFormState();
	let links = $state(initial.socialLinks.map((link) => ({ ...link })));

	// ── SEO ─────────────────────────────────────────────────────────────────
	const seoForm = createFormState();
	let seo = $state({
		siteName: initial.seo.siteName,
		siteTitle: initial.seo.siteTitle,
		siteDescription: initial.seo.siteDescription,
		ogImageUrl: initial.seo.ogImageUrl,
		pages: Object.fromEntries(
			Object.entries(initial.seo.pages).map(([key, value]) => [key, { ...value }])
		) as typeof initial.seo.pages
	});

	const PAGE_KEYS = ['home', 'blog', 'projects', 'research'] as const;

	// Dirty tracking: compare against the last-loaded server state
	const isDirty = () => {
		const s = data.settings;
		return (
			fullName !== s.identity.fullName ||
			shortName !== s.identity.shortName ||
			headline !== s.identity.headline ||
			avatarUrl !== (s.identity.avatarUrl ?? '') ||
			bioMarkdown !== s.bio.markdown ||
			JSON.stringify(links) !== JSON.stringify(s.socialLinks) ||
			seo.siteName !== s.seo.siteName ||
			seo.siteTitle !== s.seo.siteTitle ||
			seo.siteDescription !== s.seo.siteDescription ||
			seo.ogImageUrl !== s.seo.ogImageUrl ||
			JSON.stringify(seo.pages) !== JSON.stringify(s.seo.pages)
		);
	};
	useUnsavedGuard(isDirty);

	async function onAvatarChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploadingAvatar = true;
		try {
			const { url } = await uploadViaAdminApi(file);
			avatarUrl = url;
			toaster.success('Avatar uploaded. Save identity to apply.');
		} catch (err) {
			toaster.error(err instanceof Error ? err.message : 'Avatar upload failed.');
		} finally {
			uploadingAvatar = false;
		}
	}

	// Render the bio in the browser (same save-time pipeline as posts), then submit
	async function saveBio() {
		if (!bioMarkdown.trim()) {
			toaster.error('Bio cannot be empty.');
			return;
		}
		renderingBio = true;
		try {
			bioHtml = await renderMarkdown(bioMarkdown);
		} catch {
			toaster.error('Failed to render the bio. Please try again.');
			renderingBio = false;
			return;
		}
		renderingBio = false;
		await tick();
		bioFormEl?.requestSubmit();
	}

	const addLink = () => {
		links.push({ platform: 'github' as SocialPlatform, url: '' });
	};

	const removeLink = (index: number) => {
		links.splice(index, 1);
	};
</script>

<PageHeader title="Settings" description="Everything about the site that isn't a post." />

<div class="space-y-8">
	<!-- Identity -->
	<section class="rounded-lg border border-zinc-800 bg-zinc-800/40">
		<div class="border-b border-zinc-800 px-6 py-4">
			<h2 class="text-base font-medium text-zinc-100">Identity</h2>
			<p class="mt-0.5 text-sm text-zinc-500">Your name and avatar, used across the site.</p>
		</div>
		<form
			method="POST"
			action="?/identity"
			use:enhance={identityForm.enhance({ successMessage: 'Identity saved.', noReset: true })}
			class="space-y-4 px-6 py-5"
		>
			<input type="hidden" name="avatarUrl" value={avatarUrl} />

			<div class="flex items-start gap-4">
				{#if avatarUrl}
					<img src={avatarUrl} alt="Avatar" class="size-16 rounded-full object-cover" />
				{:else}
					<div
						class="flex size-16 items-center justify-center rounded-full border border-dashed border-zinc-700 text-zinc-600"
					>
						<UserIcon class="h-6 w-6" />
					</div>
				{/if}
				<div class="space-y-2 pt-1">
					<Button
						variant="secondary"
						loading={uploadingAvatar}
						onclick={() => avatarInput?.click()}
					>
						<UploadIcon class="h-4 w-4" />
						{avatarUrl ? 'Replace avatar' : 'Upload avatar'}
					</Button>
					{#if avatarUrl}
						<button
							type="button"
							onclick={() => (avatarUrl = '')}
							class="block text-xs text-zinc-500 transition-colors hover:text-red-400"
						>
							Use default avatar
						</button>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field
					label="Full name"
					forId="fullName"
					required
					error={identityForm.errors.fullName}
					hint="Byline, footer, and author metadata."
				>
					<Input
						id="fullName"
						name="fullName"
						bind:value={fullName}
						invalid={!!identityForm.errors.fullName}
					/>
				</Field>
				<Field
					label="Short name"
					forId="shortName"
					required
					error={identityForm.errors.shortName}
					hint="Navbar and admin brand."
				>
					<Input
						id="shortName"
						name="shortName"
						bind:value={shortName}
						invalid={!!identityForm.errors.shortName}
					/>
				</Field>
			</div>

			<Field
				label="Headline"
				forId="headline"
				required
				error={identityForm.errors.headline}
				hint="Completes the hero greeting: “hello, i'm …”"
			>
				<Input
					id="headline"
					name="headline"
					bind:value={headline}
					invalid={!!identityForm.errors.headline}
				/>
			</Field>

			<div class="flex justify-end">
				<Button type="submit" variant="primary" loading={identityForm.submitting}
					>Save identity</Button
				>
			</div>
		</form>
	</section>

	<!-- Bio -->
	<section class="rounded-lg border border-zinc-800 bg-zinc-800/40">
		<div class="border-b border-zinc-800 px-6 py-4">
			<h2 class="text-base font-medium text-zinc-100">Bio</h2>
			<p class="mt-0.5 text-sm text-zinc-500">
				The introduction on the home page. Markdown, rendered when you save.
			</p>
		</div>
		<form
			bind:this={bioFormEl}
			method="POST"
			action="?/bio"
			use:enhance={bioForm.enhance({ successMessage: 'Bio saved.', noReset: true })}
			class="space-y-4 px-6 py-5"
		>
			<input type="hidden" name="markdown" value={bioMarkdown} />
			<input type="hidden" name="html" value={bioHtml} />

			<MarkdownEditor
				bind:value={bioMarkdown}
				placeholder="Write your bio in Markdown..."
				minHeight="16rem"
				onUploadImage={uploadViaAdminApi}
			/>

			<div class="flex justify-end">
				<Button variant="primary" loading={renderingBio || bioForm.submitting} onclick={saveBio}>
					Save bio
				</Button>
			</div>
		</form>
	</section>

	<!-- Social links -->
	<section class="rounded-lg border border-zinc-800 bg-zinc-800/40">
		<div class="border-b border-zinc-800 px-6 py-4">
			<h2 class="text-base font-medium text-zinc-100">Social links</h2>
			<p class="mt-0.5 text-sm text-zinc-500">Shown under the bio on the home page, in order.</p>
		</div>
		<form
			method="POST"
			action="?/social"
			use:enhance={socialForm.enhance({ successMessage: 'Social links saved.', noReset: true })}
			class="space-y-4 px-6 py-5"
		>
			<input type="hidden" name="links" value={JSON.stringify(links)} />

			{#if links.length === 0}
				<p class="text-sm text-zinc-500">No links yet — add one below.</p>
			{/if}

			<div class="space-y-3">
				{#each links as link, index (index)}
					<div class="flex items-center gap-3">
						<div class="w-40 shrink-0">
							<Select bind:value={link.platform} aria-label="Platform">
								{#each Object.entries(SOCIAL_PLATFORMS) as [value, meta] (value)}
									<option {value}>{meta.label}</option>
								{/each}
							</Select>
						</div>
						<div class="min-w-0 flex-1">
							<Input
								bind:value={link.url}
								placeholder={link.platform === 'email' ? 'mailto:you@example.com' : 'https://...'}
								aria-label="URL"
							/>
						</div>
						<button
							type="button"
							onclick={() => removeLink(index)}
							title="Remove link"
							class="shrink-0 rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
						>
							<Trash2Icon class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>

			<div class="flex items-center justify-between">
				<Button variant="ghost" onclick={addLink}>
					<PlusIcon class="h-4 w-4" />
					Add link
				</Button>
				<Button type="submit" variant="primary" loading={socialForm.submitting}>Save links</Button>
			</div>
		</form>
	</section>

	<!-- SEO -->
	<section class="rounded-lg border border-zinc-800 bg-zinc-800/40">
		<div class="border-b border-zinc-800 px-6 py-4">
			<h2 class="text-base font-medium text-zinc-100">SEO &amp; meta</h2>
			<p class="mt-0.5 text-sm text-zinc-500">Titles, descriptions, and the Open Graph image.</p>
		</div>
		<form
			method="POST"
			action="?/seo"
			use:enhance={seoForm.enhance({ successMessage: 'SEO settings saved.', noReset: true })}
			class="space-y-5 px-6 py-5"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field
					label="Site name"
					forId="siteName"
					required
					error={seoForm.errors.siteName}
					hint="Open Graph site name."
				>
					<Input
						id="siteName"
						name="siteName"
						bind:value={seo.siteName}
						invalid={!!seoForm.errors.siteName}
					/>
				</Field>
				<Field
					label="Site title"
					forId="siteTitle"
					required
					error={seoForm.errors.siteTitle}
					hint="Default browser-tab title."
				>
					<Input
						id="siteTitle"
						name="siteTitle"
						bind:value={seo.siteTitle}
						invalid={!!seoForm.errors.siteTitle}
					/>
				</Field>
			</div>

			<Field
				label="Site description"
				forId="siteDescription"
				required
				error={seoForm.errors.siteDescription}
			>
				<Textarea
					id="siteDescription"
					name="siteDescription"
					bind:value={seo.siteDescription}
					rows={2}
					invalid={!!seoForm.errors.siteDescription}
				/>
			</Field>

			<Field label="Open Graph image URL" forId="ogImageUrl" hint="Absolute URL, ideally 1200×630.">
				<Input id="ogImageUrl" name="ogImageUrl" type="url" bind:value={seo.ogImageUrl} />
			</Field>

			<div class="space-y-4 border-t border-zinc-800 pt-4">
				<h3 class="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Per-page meta</h3>
				{#each PAGE_KEYS as page (page)}
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
						<Field label="{page} title" forId="{page}Title">
							<Input id="{page}Title" name="{page}Title" bind:value={seo.pages[page].title} />
						</Field>
						<Field label="{page} description" forId="{page}Description">
							<Input
								id="{page}Description"
								name="{page}Description"
								bind:value={seo.pages[page].description}
							/>
						</Field>
					</div>
				{/each}
			</div>

			<div class="flex justify-end">
				<Button type="submit" variant="primary" loading={seoForm.submitting}>Save SEO</Button>
			</div>
		</form>
	</section>
</div>

<input
	bind:this={avatarInput}
	type="file"
	accept="image/*"
	class="sr-only"
	onchange={onAvatarChange}
/>
