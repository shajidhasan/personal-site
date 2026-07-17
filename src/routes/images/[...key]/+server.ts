import { error } from '@sveltejs/kit';

export const GET = async ({ params, platform }) => {
	const object = await platform!.env.IMAGES.get(params.key);

	if (!object) {
		error(404, 'Image not found');
	}

	return new Response(object.body as ReadableStream, {
		headers: {
			'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
			'cache-control': 'public, max-age=31536000, immutable',
			etag: object.httpEtag
		}
	});
};
