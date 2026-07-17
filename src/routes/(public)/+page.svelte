<script>
	import Blog from '$lib/components/home/Blog.svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import Projects from '$lib/components/home/Projects.svelte';
	import Research from '$lib/components/home/Research.svelte';

	let { data } = $props();
</script>

<Hero settings={data.settings} />
<Projects projects={data.projects} />
<Research papers={data.featuredPapers} />
<Blog blogPosts={data.blogPosts} />
