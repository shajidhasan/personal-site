<script lang="ts">
	import PageHeader from '$lib/components/admin/ui/PageHeader.svelte';
	import Button from '$lib/components/admin/ui/Button.svelte';
	import { formatTimestamp } from '$lib/utilities';

	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import FolderGitIcon from '@lucide/svelte/icons/folder-git-2';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import ClipboardIcon from '@lucide/svelte/icons/clipboard';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import EyeIcon from '@lucide/svelte/icons/eye';

	let { data } = $props();

	const cards = $derived([
		{
			label: 'Blog posts',
			value: data.stats.posts,
			detail:
				data.stats.drafts > 0
					? `${data.stats.drafts} draft${data.stats.drafts === 1 ? '' : 's'}`
					: null,
			href: '/admin/blog',
			Icon: NewspaperIcon
		},
		{
			label: 'Notes',
			value: data.stats.notes,
			detail: null,
			href: '/admin/notes',
			Icon: StickyNoteIcon
		},
		{
			label: 'Projects',
			value: data.stats.projects,
			detail: null,
			href: '/admin/projects',
			Icon: FolderGitIcon
		},
		{
			label: 'Papers',
			value: data.stats.papers,
			detail: null,
			href: '/admin/research',
			Icon: GraduationCapIcon
		},
		{
			label: 'Pastes',
			value: data.stats.pastes,
			detail: null,
			href: '/admin/pastebin',
			Icon: ClipboardIcon
		},
		{
			label: 'Short links',
			value: data.stats.links,
			detail: null,
			href: '/admin/url-shortener',
			Icon: LinkIcon
		}
	]);
</script>

<PageHeader title="Dashboard" description="An overview of everything on the site.">
	{#snippet actions()}
		<Button variant="secondary" href="/admin/notes/new">New note</Button>
		<Button variant="secondary" href="/admin/pastebin/new">New paste</Button>
		<Button variant="secondary" href="/admin/url-shortener/new">New link</Button>
		<Button variant="primary" href="/admin/blog/new">
			<PlusIcon class="h-4 w-4" />
			New post
		</Button>
	{/snippet}
</PageHeader>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
	{#each cards as { label, value, detail, href, Icon } (href)}
		<a
			{href}
			class="group rounded-lg border border-zinc-800 bg-zinc-800/40 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm text-zinc-400">{label}</p>
				<Icon class="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
			</div>
			<p class="mt-2 text-3xl font-medium text-zinc-100">{value}</p>
			{#if detail}
				<p class="mt-1 text-xs text-amber-400/80">{detail}</p>
			{/if}
		</a>
	{/each}
</div>

{#if data.recentPosts.length > 0}
	<section class="mt-10">
		<h2 class="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">
			Recently updated
		</h2>
		<div class="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-800/40">
			{#each data.recentPosts as recent (recent.id)}
				<a
					href="/admin/blog/{recent.id}"
					class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/70"
				>
					<div class="min-w-0">
						<p class="truncate text-sm font-medium text-zinc-200">{recent.title}</p>
						<p class="mt-0.5 text-xs text-zinc-500">
							{formatTimestamp(recent.updatedAt)}
						</p>
					</div>
					<div class="flex shrink-0 items-center gap-3 text-xs">
						{#if recent.isPublished}
							<span class="flex items-center gap-1 text-zinc-500">
								<EyeIcon class="h-3.5 w-3.5" />
								{recent.visitCount}
							</span>
							<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
								Published
							</span>
						{:else}
							<span class="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">Draft</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}
