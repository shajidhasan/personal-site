import clipboard from 'clipboardy';
import openUrl from 'open';
import * as p from '@clack/prompts';

export const fail = (message: string): never => {
	p.log.error(message);
	process.exit(1);
};

export const succeed = async (url: string, opts: { open: boolean }): Promise<void> => {
	let copied = true;
	try {
		await clipboard.write(url);
	} catch {
		// Linux needs xclip/xsel/wl-copy; the URL is still printed, so this is not fatal.
		copied = false;
	}

	p.log.success(url);
	p.outro(copied ? 'Copied to clipboard.' : 'Could not access the clipboard — URL printed above.');

	if (opts.open) await openUrl(url);
};
