import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { paste } from '$lib/server/db/schema';
import { isUniqueConstraintError } from '$lib/server/blog-form';
import { generateRandomString } from '$lib/utilities';

const parsePasteForm = (formData: FormData) => {
	const str = (name: string) => {
		const value = formData.get(name);
		return typeof value === 'string' ? value : '';
	};

	return {
		title: str('title').trim(),
		alias: str('alias').trim(),
		language: str('language').trim() || 'plaintext',
		content: str('content'),
		contentHtml: str('contentHtml')
	};
};

export const actions = {
	default: async ({ request, platform }) => {
		const values = parsePasteForm(await request.formData());
		if (!values.title) {
			return fail(400, { message: 'Title is required.', errors: { title: 'Title is required.' } });
		}
		if (!values.content.trim()) {
			return fail(400, { message: 'Content is required.' });
		}

		const db = getDb(platform!.env.DB);
		const alias = values.alias || generateRandomString(6);

		try {
			await db.insert(paste).values({ ...values, alias });
		} catch (e) {
			if (isUniqueConstraintError(e)) {
				return fail(400, {
					message: 'This alias is already taken.',
					errors: { alias: 'This alias is already taken.' }
				});
			}
			return fail(500, { message: 'Failed to create paste.' });
		}

		return { message: 'New paste created!', alias };
	}
};
