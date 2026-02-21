'use server';

import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<void> {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		throw new Error(`Sign-out failed: ${error.message}`);
	}

	redirect('/login');
}
