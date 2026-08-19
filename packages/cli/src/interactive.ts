import * as p from '@clack/prompts';
import clipboard from 'clipboardy';
import openUrl from 'open';
import { fetchList, remove, type ListItem, type ResourceName } from './commands';

const label = (item: ListItem): string => {
	const name = item.title ?? item.destinationUrl ?? '(untitled)';
	return `${item.alias}  ${name}  ${item.visitCount} views`;
};

export const interactive = async (): Promise<void> => {
	p.intro('sh4');

	const resource = await p.select({
		message: 'What do you want to manage?',
		options: [
			{ value: 'notes', label: 'Notes' },
			{ value: 'pastes', label: 'Pastes' },
			{ value: 'links', label: 'Short links' }
		]
	});

	if (p.isCancel(resource)) return p.outro('Cancelled.');

	const items = await fetchList(resource as ResourceName);
	if (items.length === 0) return p.outro(`No ${resource} yet.`);

	const chosen = await p.select({
		message: `Pick one of ${items.length}`,
		options: items.map((item) => ({ value: item.id, label: label(item) }))
	});

	if (p.isCancel(chosen)) return p.outro('Cancelled.');

	const item = items.find((candidate) => candidate.id === chosen)!;

	const action = await p.select({
		message: item.url,
		options: [
			{ value: 'copy', label: 'Copy URL' },
			{ value: 'open', label: 'Open in browser' },
			{ value: 'delete', label: 'Delete' }
		]
	});

	if (p.isCancel(action)) return p.outro('Cancelled.');

	if (action === 'copy') {
		await clipboard.write(item.url);
		return p.outro('Copied.');
	}

	if (action === 'open') {
		await openUrl(item.url);
		return p.outro('Opened.');
	}

	const confirmed = await p.confirm({ message: `Delete ${item.alias}? This cannot be undone.` });
	if (p.isCancel(confirmed) || !confirmed) return p.outro('Cancelled.');

	await remove(resource as ResourceName, item.id);
	p.outro(`Deleted ${item.alias}.`);
};
