<script lang="ts">
	import Footer from '$lib/components/shared/Footer.svelte';
	import Navbar from '$lib/components/shared/Navbar.svelte';

	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import { navigating, page } from '$app/state';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';

	let { data, children } = $props();

	// Theme initialization lives in app.html so it runs before first paint.

	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));

	NProgress.configure({ showSpinner: false });

	$effect(() => {
		if (navigating.from !== null) {
			NProgress.start();
		} else {
			NProgress.done();
		}
	});
</script>

<MetaTags {...metaTags} />

<Navbar />
{@render children()}
<Footer />
