import type { Component } from 'svelte';
import type { SocialPlatform } from '$lib/types';

import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
import SiX from '@icons-pack/svelte-simple-icons/icons/SiX';
import SiGooglescholar from '@icons-pack/svelte-simple-icons/icons/SiGooglescholar';
import SiOrcid from '@icons-pack/svelte-simple-icons/icons/SiOrcid';
import MailIcon from '@lucide/svelte/icons/mail';
import LinkedIn from '$lib/components/icons/LinkedIn.svelte';

export const SOCIAL_PLATFORMS: Record<SocialPlatform, { label: string; icon: Component }> = {
	github: { label: 'GitHub', icon: SiGithub as unknown as Component },
	x: { label: 'X (Twitter)', icon: SiX as unknown as Component },
	linkedin: { label: 'LinkedIn', icon: LinkedIn as unknown as Component },
	email: { label: 'Email', icon: MailIcon as unknown as Component },
	scholar: { label: 'Google Scholar', icon: SiGooglescholar as unknown as Component },
	orcid: { label: 'ORCID', icon: SiOrcid as unknown as Component }
};
