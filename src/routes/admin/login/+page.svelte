<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import LockIcon from '@lucide/svelte/icons/lock';

	import Button from '$lib/components/admin/ui/Button.svelte';
	import Field from '$lib/components/admin/ui/Field.svelte';
	import Input from '$lib/components/admin/ui/Input.svelte';

	let email: string = $state('');
	let password: string = $state('');
	let loading: boolean = $state(false);
	let errorMessage: string = $state('');

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		loading = true;
		errorMessage = '';

		const { error } = await authClient.signIn.email({ email, password });

		if (error) {
			errorMessage = error.message || 'Invalid email or password.';
			loading = false;
			return;
		}

		// Full reload so the session cookie is picked up by the server hooks.
		window.location.href = '/admin';
	};
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-200">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<p class="text-2xl font-semibold tracking-wider text-zinc-100">sh4jid</p>
			<p class="mt-2 text-sm text-zinc-400">Sign in to the admin panel</p>
		</div>

		<form
			onsubmit={handleSubmit}
			class="space-y-5 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8"
		>
			<Field label="Email" forId="login-email">
				<Input
					id="login-email"
					bind:value={email}
					type="email"
					name="email"
					placeholder="you@example.com"
					autocomplete="email"
					disabled={loading}
					invalid={!!errorMessage}
				/>
			</Field>

			<Field label="Password" forId="login-password" error={errorMessage}>
				<Input
					id="login-password"
					bind:value={password}
					type="password"
					name="password"
					placeholder="••••••••••••"
					autocomplete="current-password"
					disabled={loading}
					invalid={!!errorMessage}
				/>
			</Field>

			<!-- Grid wrapper stretches the Button full-width without overriding its classes. -->
			<div class="grid pt-1">
				<Button type="submit" variant="primary" {loading}>
					<LockIcon class="h-4 w-4" />
					Sign in
				</Button>
			</div>
		</form>
	</div>
</div>
