import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest, NextResponse } from 'next/server';

export function createSupabaseMiddlewareClient(
	request: NextRequest,
	response: NextResponse,
): { supabase: SupabaseClient; response: NextResponse } {
	const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					request.cookies.set(name, value);
					response.cookies.set(name, value, options);
				}
			},
		},
	});

	return { supabase, response };
}
