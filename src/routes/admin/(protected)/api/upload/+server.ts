import { error, json } from '@sveltejs/kit';
import { uploadImage, ImageValidationError } from '$lib/server/images';

// JSON upload endpoint for the admin editors (drag/drop, paste, toolbar).
// Auth is enforced by the /admin guard in hooks.server.ts.
export const POST = async ({ request, platform }) => {
	const formData = await request.formData();

	try {
		const { key, url } = await uploadImage(platform!.env.IMAGES, formData.get('file'));
		return json({ key, url });
	} catch (e) {
		if (e instanceof ImageValidationError) error(400, e.message);
		console.error('Image upload failed:', e);
		error(500, 'Failed to upload image.');
	}
};
