import { fail } from '@sveltejs/kit';
import { uploadImage, ImageValidationError } from '$lib/server/images';

export const load = async ({ platform }) => {
	const list = await platform!.env.IMAGES.list({ limit: 500 });

	const images = list.objects
		.map((object) => ({
			key: object.key,
			size: object.size,
			uploaded: object.uploaded.toISOString()
		}))
		.sort((a, b) => b.uploaded.localeCompare(a.uploaded));

	return { images };
};

export const actions = {
	upload: async ({ request, platform }) => {
		const formData = await request.formData();
		const file = formData.get('file');

		try {
			await uploadImage(platform!.env.IMAGES, file);
		} catch (e) {
			if (e instanceof ImageValidationError) return fail(400, { message: e.message });
			return fail(500, { message: 'Failed to upload image.' });
		}

		return { message: 'Image uploaded successfully!' };
	},

	delete: async ({ request, platform }) => {
		const formData = await request.formData();
		const key = formData.get('key');
		if (typeof key !== 'string' || !key) return fail(400, { message: 'Missing image key.' });

		try {
			await platform!.env.IMAGES.delete(key);
		} catch {
			return fail(500, { message: 'Failed to delete image.' });
		}

		return { message: 'Image deleted successfully!' };
	}
};
