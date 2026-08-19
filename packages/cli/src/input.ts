import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Source = { content: string; filePath?: string };

const readStdin = async (): Promise<string> => {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
	return Buffer.concat(chunks).toString('utf8');
};

// `-` or a missing argument with piped input both mean "read stdin".
export const readSource = async (arg?: string): Promise<Source> => {
	if (!arg || arg === '-') {
		if (process.stdin.isTTY) {
			throw new Error('No input. Pass a file path, or pipe content in.');
		}
		return { content: await readStdin() };
	}

	const filePath = resolve(arg);
	return { content: readFileSync(filePath, 'utf8'), filePath };
};
