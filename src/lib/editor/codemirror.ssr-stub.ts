// SSR replacement for $lib/editor/codemirror (see vite.config.ts).
//
// CodeMirror only ever runs in the admin browser; this stub keeps it out of the
// Worker bundle. If one of these throws, a server code path is wrongly trying
// to construct an editor — editors are created in onMount only.
const clientOnly = (): never => {
	throw new Error('$lib/editor/codemirror is client-only; create editors in onMount.');
};

export const createMarkdownEditor = clientOnly;
export const createCodeEditor = clientOnly;
