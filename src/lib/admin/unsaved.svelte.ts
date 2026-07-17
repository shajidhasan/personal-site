import { beforeNavigate } from '$app/navigation';

/**
 * Warns before leaving a page with unsaved changes. Call during component init:
 *
 *   useUnsavedGuard(() => isDirty);
 *
 * Pass a getter so the current value is read at navigation time.
 */
export const useUnsavedGuard = (isDirty: () => boolean) => {
	beforeNavigate((navigation) => {
		if (!isDirty()) return;
		// Full-page/external navigations get the native beforeunload prompt instead
		if (navigation.type === 'leave') return;
		if (!confirm('You have unsaved changes. Leave this page?')) {
			navigation.cancel();
		}
	});

	$effect(() => {
		const handler = (event: BeforeUnloadEvent) => {
			if (isDirty()) event.preventDefault();
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	});
};
