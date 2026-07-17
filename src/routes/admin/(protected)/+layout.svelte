<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import Toaster from '$lib/components/admin/Toaster.svelte';

	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import FolderGitIcon from '@lucide/svelte/icons/folder-git-2';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import ClipboardIcon from '@lucide/svelte/icons/clipboard';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ImageIcon from '@lucide/svelte/icons/image';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';

	let { children } = $props();

	let mobileNavOpen = $state(false);

	const groups = [
		{
			label: 'Content',
			items: [
				{ title: 'Blog', href: '/admin/blog', Icon: NewspaperIcon },
				{ title: 'Notes', href: '/admin/notes', Icon: StickyNoteIcon },
				{ title: 'Projects', href: '/admin/projects', Icon: FolderGitIcon },
				{ title: 'Research', href: '/admin/research', Icon: GraduationCapIcon }
			]
		},
		{
			label: 'Tools',
			items: [
				{ title: 'Pastebin', href: '/admin/pastebin', Icon: ClipboardIcon },
				{ title: 'Short Links', href: '/admin/url-shortener', Icon: LinkIcon },
				{ title: 'Images', href: '/admin/images', Icon: ImageIcon }
			]
		},
		{
			label: 'Site',
			items: [{ title: 'Settings', href: '/admin/settings', Icon: SettingsIcon }]
		}
	];

	const isActive = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);

	// Close the mobile nav on navigation
	$effect(() => {
		void page.url.pathname;
		mobileNavOpen = false;
	});

	async function handleLogout() {
		await authClient.signOut();
		// Full reload so the cleared session cookie is picked up by the server hooks.
		window.location.href = '/admin/login';
	}
</script>

{#snippet navLinks()}
	<a
		href="/admin"
		class="group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors {isActive(
			'/admin'
		)
			? 'bg-zinc-800 font-medium text-rose-400'
			: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'}"
	>
		<LayoutDashboardIcon class="h-4 w-4 shrink-0" />
		Dashboard
	</a>

	{#each groups as group (group.label)}
		<div class="mt-6">
			<p class="mb-1.5 px-3 text-[11px] font-semibold tracking-widest text-zinc-600 uppercase">
				{group.label}
			</p>
			<div class="space-y-0.5">
				{#each group.items as { title, href, Icon } (href)}
					<a
						{href}
						class="group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors {isActive(
							href
						)
							? 'bg-zinc-800 font-medium text-rose-400'
							: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'}"
					>
						<Icon class="h-4 w-4 shrink-0" />
						{title}
					</a>
				{/each}
			</div>
		</div>
	{/each}
{/snippet}

<div class="min-h-screen bg-zinc-900 text-zinc-200">
	<!-- Desktop sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-800 bg-zinc-950 md:flex"
	>
		<a
			href="/admin"
			class="flex h-16 shrink-0 items-center border-b border-zinc-800 px-6 text-lg font-semibold tracking-wider text-zinc-100 transition-colors hover:text-rose-400"
		>
			sh4jid
		</a>

		<nav class="flex-1 overflow-y-auto px-3 py-4">
			{@render navLinks()}
		</nav>

		<div class="shrink-0 border-t border-zinc-800 p-3">
			<button
				onclick={handleLogout}
				class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
			>
				<LogoutIcon class="h-4 w-4 shrink-0" />
				Logout
			</button>
			<p class="mt-3 px-3 text-[11px] text-zinc-600">
				© {new Date().getFullYear()} Shajid Hasan Naim
			</p>
		</div>
	</aside>

	<!-- Mobile top bar -->
	<header
		class="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:hidden"
	>
		<a href="/admin" class="text-lg font-semibold tracking-wider text-zinc-100">sh4jid</a>
		<button
			type="button"
			onclick={() => (mobileNavOpen = !mobileNavOpen)}
			aria-label="Toggle navigation"
			class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
		>
			{#if mobileNavOpen}
				<XIcon class="h-5 w-5" />
			{:else}
				<MenuIcon class="h-5 w-5" />
			{/if}
		</button>
	</header>

	<!-- Mobile slide-over nav -->
	<div
		class="fixed inset-0 top-14 z-30 transform bg-zinc-950 transition-transform duration-200 md:hidden {mobileNavOpen
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		<nav class="h-full overflow-y-auto px-3 py-4">
			{@render navLinks()}
			<div class="mt-6 border-t border-zinc-800 pt-3">
				<button
					onclick={handleLogout}
					class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
				>
					<LogoutIcon class="h-4 w-4 shrink-0" />
					Logout
				</button>
			</div>
		</nav>
	</div>

	<!-- Content -->
	<main class="pt-14 md:pt-0 md:pl-60">
		<div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-10">
			{@render children()}
		</div>
	</main>
</div>

<Toaster />
