// Reuses the site's exact pipeline so CLI content is byte-identical to admin-created
// content — same shiki themes, same <code-block> markup the public pages expect.
// tsup bundles this in, so the published package has no dependency on the site source.
export { highlightCode, renderMarkdown } from '../../../src/lib/markdown';
