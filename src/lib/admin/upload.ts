/** Uploads an image through the admin JSON endpoint; returns its site-relative URL. */
export const uploadViaAdminApi = async (file: File): Promise<{ url: string }> => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch('/admin/api/upload', { method: 'POST', body: formData });
	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as { message?: string } | null;
		throw new Error(body?.message ?? `Upload failed (${response.status})`);
	}

	return response.json();
};
