import type { SubmitFunction } from '@sveltejs/kit';
import type { ActionResult } from '@sveltejs/kit';
import { toaster } from '$lib/services/toaster.svelte';

/**
 * Shared submission state + use:enhance wrapper for admin forms.
 *
 * Server actions standardize on `fail(status, { message?, errors? })` where
 * `errors` maps field names to messages — those surface inline via <Field error>,
 * and `message` (or a generic fallback) goes to the toaster.
 *
 *   const form = createFormState();
 *   <form use:enhance={form.enhance({ onSuccess: ... })}>
 *   <Button loading={form.submitting}>
 *   <Field error={form.errors.slug}>
 */
export interface FormFailure {
	message?: string;
	errors?: Record<string, string>;
}

export const createFormState = () => {
	let submitting = $state(false);
	let errors = $state<Record<string, string>>({});

	return {
		get submitting() {
			return submitting;
		},
		get errors() {
			return errors;
		},
		clear() {
			errors = {};
		},
		enhance(options?: {
			onSuccess?: (result: Extract<ActionResult, { type: 'success' }>) => void | Promise<void>;
			successMessage?: string;
			/** Skip the automatic `update()` (e.g. to keep form values). */
			noReset?: boolean;
		}): SubmitFunction {
			return () => {
				submitting = true;
				errors = {};

				return async ({ result, update }) => {
					submitting = false;

					if (result.type === 'failure') {
						const data = (result.data ?? {}) as FormFailure;
						errors = data.errors ?? {};
						toaster.error(data.message ?? 'Something went wrong. Please check the form.');
					} else if (result.type === 'error') {
						toaster.error(result.error?.message ?? 'Something went wrong.');
					} else if (result.type === 'success') {
						if (options?.successMessage) toaster.success(options.successMessage);
						await options?.onSuccess?.(result);
					}

					await update({ reset: !options?.noReset });
				};
			};
		}
	};
};

export type FormState = ReturnType<typeof createFormState>;
