// Shared shape for the per-entity form/JSON validators (note-form, paste-form, link-form).
// Mirrors the ParseResult convention already used by blog-form.ts.
export type Validated<T> = { error: string; values?: never } | { error?: never; values: T };

export const formString = (formData: FormData, name: string): string => {
	const value = formData.get(name);
	return typeof value === 'string' ? value : '';
};
