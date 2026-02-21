import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
	const cookieStore = await cookies();

	return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					try {
						cookieStore.set(name, value, options);
					} catch {
						// setAll is called from Server Components where cookies cannot be set.
						// This can be safely ignored when the middleware refreshes the session.
					}
				}
			},
		},
	});
}
