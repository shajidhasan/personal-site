export const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return '';

	const parsed = date instanceof Date ? date : new Date(date);

	if (isNaN(parsed.getTime())) {
		console.warn(`Invalid date provided to formatDate: ${date}`);
		return String(date);
	}

	return parsed.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};

export const formatTimestamp = (date: string | Date | null | undefined): string => {
	if (!date) return 'N/A';
	return new Date(date).toLocaleString(undefined, {
		year: '2-digit',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
};

const WORDS_PER_MINUTE = 200;

export const calculateReadTime = (text: string | undefined | null): number => {
	if (!text || text.trim() === '') {
		return 0;
	}

	const withoutHtml = text.replace(/<\/?[^>]+(>|$)/g, '');

	const withoutMarkdown = withoutHtml
		.replace(/!\[.*?\]\(.*?\)/g, '')
		.replace(/\[(.*?)\]\(.*?\)/g, '$1')
		.replace(/#{1,6}\s/g, '')
		.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
		.replace(/(\*|_)(.*?)(\*|_)/g, '$2')
		.replace(/~~(.*?)~~/g, '$1')
		.replace(/`{3}[\s\S]*?`{3}/g, '')
		.replace(/`{1,2}(.*?)`{1,2}/g, '$1')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*>\s+/gm, '');

	const words = withoutMarkdown.match(/\b\w+\b/g);
	const wordCount = words ? words.length : 0;

	return Math.ceil(wordCount / WORDS_PER_MINUTE);
};

export const generateRandomString = (length: number): string => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

export const slugify = (text: string): string =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
