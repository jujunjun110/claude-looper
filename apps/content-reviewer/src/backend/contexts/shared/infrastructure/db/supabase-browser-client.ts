import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient(): SupabaseClient {
	return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
