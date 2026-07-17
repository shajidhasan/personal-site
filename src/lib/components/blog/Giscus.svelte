<script lang="ts">
	import { onMount } from 'svelte';

	let container: HTMLDivElement;

	const currentTheme = (): string =>
		document.documentElement.classList.contains('dark') ? 'dark' : 'light';

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.async = true;
		script.crossOrigin = 'anonymous';

		const config: Record<string, string> = {
			'data-repo': 'shajidhasan/sh4jid.me-comments',
			'data-repo-id': 'R_kgDOTbQeEw',
			'data-category': 'Announcements',
			'data-category-id': 'DIC_kwDOTbQeE84DBYD3',
			'data-mapping': 'pathname',
			'data-strict': '0',
			'data-reactions-enabled': '1',
			'data-emit-metadata': '0',
			'data-input-position': 'bottom',
			'data-theme': currentTheme(),
			'data-lang': 'en',
			'data-loading': 'lazy'
		};
		for (const [key, value] of Object.entries(config)) {
			script.setAttribute(key, value);
		}

		container.appendChild(script);

		// Keep the giscus iframe in sync with the site's theme toggle
		const observer = new MutationObserver(() => {
			const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
			iframe?.contentWindow?.postMessage(
				{ giscus: { setConfig: { theme: currentTheme() } } },
				'https://giscus.app'
			);
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => observer.disconnect();
	});
</script>

<section class="mt-16 border-t border-gray-200 pt-12 dark:border-gray-700">
	<div bind:this={container}></div>
</section>
