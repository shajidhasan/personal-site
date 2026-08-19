import { Command } from 'commander';
import * as p from '@clack/prompts';
import { ApiError, NotLoggedInError } from './api';
import { clearConfig } from './config';
import { login, logout, whoami } from './auth';
import { createLink, createNote, createPaste, list } from './commands';
import { interactive } from './interactive';

const program = new Command();

program
	.name('sh4')
	.description('Share notes, pastes, and short links from the terminal.')
	.version('0.1.0');

program
	.command('login')
	.description('Authorise this machine from a browser')
	.option('--base-url <url>', 'site to authenticate against')
	.action((opts) => login({ baseUrl: opts.baseUrl }));

program.command('logout').description('Forget the stored credential').action(logout);
program.command('whoami').description('Show the current login').action(whoami);

program
	.command('note [file]')
	.alias('n')
	.description('Upload a markdown file (or stdin) as a note')
	.option('-a, --alias <alias>', 'custom alias')
	.option('-t, --title <title>', 'override the inferred title')
	.option('-f, --force', 'overwrite an existing alias')
	.option('-o, --open', 'open in a browser afterwards')
	.action(createNote);

program
	.command('paste [file]')
	.alias('p')
	.description('Upload a file (or stdin) as a highlighted paste')
	.option('-a, --alias <alias>', 'custom alias')
	.option('-t, --title <title>', 'override the inferred title')
	.option('-l, --language <lang>', 'override the inferred language')
	.option('-f, --force', 'overwrite an existing alias')
	.option('-o, --open', 'open in a browser afterwards')
	.action(createPaste);

program
	.command('link <url>')
	.alias('l')
	.description('Shorten a URL')
	.option('-a, --alias <alias>', 'custom alias')
	.option('-m, --message <message>', 'message shown on the interstitial')
	.option('-f, --force', 'overwrite an existing alias')
	.option('-o, --open', 'open in a browser afterwards')
	.action(createLink);

program
	.command('ls [type]')
	.description('List notes, pastes, or links')
	.action((type) => list(type));

// Bare `sh4` opens the picker.
program.action(() => interactive());

const main = async () => {
	try {
		await program.parseAsync(process.argv);
	} catch (e) {
		if (e instanceof NotLoggedInError) {
			p.log.error(e.message);
			process.exit(1);
		}
		if (e instanceof ApiError) {
			if (e.status === 401) {
				clearConfig();
				p.log.error("Access revoked. Run 'sh4 login'.");
				process.exit(1);
			}
			if (e.status === 409) {
				p.log.error(`${e.message} Pass -f to overwrite it.`);
				process.exit(1);
			}
			p.log.error(e.message);
			process.exit(1);
		}
		if (e instanceof TypeError) {
			// fetch() throws TypeError when the host is unreachable.
			p.log.error('Could not reach the site. Check your connection and `sh4 whoami`.');
			process.exit(1);
		}
		p.log.error(e instanceof Error ? e.message : String(e));
		process.exit(1);
	}
};

void main();
