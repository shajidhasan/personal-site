import { defineConfig } from 'tsup';

export default defineConfig({
	entry: { index: 'src/index.ts' },
	format: ['esm'],
	platform: 'node',
	target: 'node20',
	clean: true,
	// The site's src/lib/markdown.ts is imported by relative path, so it gets bundled in and
	// the published package carries no dependency on the site source tree. npm dependencies
	// stay external and are installed normally — bundling them would force CJS packages
	// through esbuild's ESM require() shim, which cannot load node builtins.
	banner: { js: '#!/usr/bin/env node' }
});
