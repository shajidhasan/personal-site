const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export class ImageValidationError extends Error {}

/**
 * Validates and stores an image in R2 under uploads/<yyyy>/<mm>/<uuid>-<name>.
 * Returns the object key and the site-relative URL it is served from.
 */
export const uploadImage = async (
	bucket: R2Bucket,
	file: unknown
): Promise<{ key: string; url: string }> => {
	if (!(file instanceof File) || file.size === 0) {
		throw new ImageValidationError('No file selected.');
	}
	if (!file.type.startsWith('image/')) {
		throw new ImageValidationError('Invalid file type. Please upload an image.');
	}
	if (file.size > MAX_SIZE) {
		throw new ImageValidationError('File is too large. Max size is 10 MB.');
	}

	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
	const key = `uploads/${yyyy}/${mm}/${crypto.randomUUID()}-${sanitizedName}`;

	// arrayBuffer, not stream: R2 put needs a known length (files are ≤10MB anyway)
	await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

	return { key, url: `/images/${key}` };
};
