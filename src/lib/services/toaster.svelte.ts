interface ToasterService {
	show: boolean;
	message: string;
	type: 'success' | 'error';
	success: (message: string) => Promise<void>;
	error: (message: string) => Promise<void>;
}

export const toaster: ToasterService = $state({
	show: false,
	message: '',
	type: 'success',

	success: async (message: string) => {
		toaster.message = message;
		toaster.type = 'success';
		toaster.show = true;
		await new Promise((resolve) => setTimeout(resolve, 3000));
		toaster.show = false;
	},
	error: async (message: string) => {
		toaster.message = message;
		toaster.type = 'error';
		toaster.show = true;
		await new Promise((resolve) => setTimeout(resolve, 3000));
		toaster.show = false;
	}
});
