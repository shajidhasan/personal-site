<script lang="ts">
	import { page } from '$app/state';
</script>

<footer class="bg-gray-100 py-12 dark:bg-gray-800/20">
	<div class="mx-auto max-w-4xl px-6 text-center">
		<p class="flex flex-col text-gray-600 sm:block dark:text-gray-400">
			<span>
				© {new Date().getFullYear()}
				{page.data.settings?.identity.fullName ?? 'Shajid Hasan Naim'}.
			</span>
			<span> Thanks for stopping by. </span>
		</p>
		<p class="mt-2 text-sm text-gray-500 dark:text-gray-500">
			<a
				href="https://github.com/shajidhasan/personal-site"
				target="_blank"
				rel="noopener noreferrer"
				class="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300"
			>
				View source on GitHub
			</a>
		</p>
	</div>
</footer>
