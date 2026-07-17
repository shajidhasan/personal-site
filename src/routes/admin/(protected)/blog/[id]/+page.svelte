<script lang="ts">
	import BlogPostEditor from '$lib/components/admin/BlogPostEditor.svelte';

	let { data } = $props();
</script>

<BlogPostEditor mode="edit" initial={data.blogPost} />
