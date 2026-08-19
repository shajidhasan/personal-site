import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import type { Plugin } from 'vite';
// vitest/config re-exports defineConfig with the `test` option typed in.
import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Client-only heavyweights (marked + shiki ~2MB gzip; CodeMirror) run in the admin
// browser only. Admin pages import them at module level, which would drag them into
// the Worker bundle via SSR — swap each for a throwing stub in the server build.
const SSR_STUBS: Record<string, string> = {
	'$lib/markdown': 'src/lib/markdown.ssr-stub.ts',
	'$lib/editor/codemirror': 'src/lib/editor/codemirror.ssr-stub.ts'
};

const ssrStub = (): Plugin => ({
	name: 'ssr-stub',
	enforce: 'pre',
	resolveId(id, importer, options) {
		if (!options?.ssr) return;
		for (const [alias, stub] of Object.entries(SSR_STUBS)) {
			if (id === alias || id.endsWith(alias.replace('$lib', '/lib'))) {
				return path.resolve(__dirname, stub);
			}
		}
	}
});

export default defineConfig({
	plugins: [
		ssrStub(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			vitePlugin: {
				// Only CodeBlock compiles as a custom element (<code-block>, used inside stored post HTML)
				dynamicCompileOptions({ filename }) {
					if (filename.endsWith('CodeBlock.svelte')) {
						return { customElement: true };
					}
				}
			},
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'packages/cli/src/**/*.test.ts'],
		environment: 'node'
	}
});
