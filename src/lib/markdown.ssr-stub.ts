// SSR replacement for $lib/markdown (see vite.config.ts).
//
// Markdown rendering happens in the admin browser at save time; the server only
// stores/serves pre-rendered HTML. This stub keeps marked + shiki (~2MB gzip)
// out of the Worker bundle. If one of these ever throws, a server code path is
// wrongly trying to render markdown — move that work to the client.
const clientOnly = (): never => {
	throw new Error('$lib/markdown is client-only; render markdown in the browser at save time.');
};

export const renderMarkdown = clientOnly;
export const highlightCode = clientOnly;
export const marked = new Proxy({}, { get: clientOnly });
