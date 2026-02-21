'use server';

import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signInWithGoogle(): Promise<void> {
	const supabase = await createSupabaseServerClient();
	const headerStore = await headers();
	const origin = headerStore.get('origin') ?? '';

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		throw new Error(`Google OAuth sign-in failed: ${error.message}`);
	}

	if (data.url) {
		redirect(data.url);
	}
}
