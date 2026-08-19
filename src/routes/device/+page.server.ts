import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	// Approving a CLI login requires being the signed-in admin. This route is outside /admin,
	// so handleAdminGuard in hooks.server.ts does not cover it.
	if (!locals.session) {
		redirect(302, `/admin/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Prefilled when the user follows the CLI's verification_uri_complete link.
	return { presetCode: url.searchParams.get('user_code') ?? '' };
};

const readUserCode = async (request: Request): Promise<string> =>
	String((await request.formData()).get('userCode') ?? '')
		.trim()
		.toUpperCase();

export const actions = {
	approve: async ({ request, locals }) => {
		const userCode = await readUserCode(request);
		if (!userCode) return fail(400, { message: 'Enter the code shown in your terminal.' });

		try {
			await locals.auth.api.deviceApprove({ body: { userCode }, headers: request.headers });
		} catch {
			return fail(400, { message: 'That code is invalid or has expired. Run `sh4 login` again.' });
		}

		return { success: true, message: 'Approved. Your terminal should continue in a moment.' };
	},

	deny: async ({ request, locals }) => {
		const userCode = await readUserCode(request);
		if (!userCode) return fail(400, { message: 'Enter the code shown in your terminal.' });

		try {
			await locals.auth.api.deviceDeny({ body: { userCode }, headers: request.headers });
		} catch {
			return fail(400, { message: 'That code is invalid or has expired.' });
		}

		return { success: true, message: 'Denied. That device was not given access.' };
	}
};
