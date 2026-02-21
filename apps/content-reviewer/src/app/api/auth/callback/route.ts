import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const { searchParams, origin } = request.nextUrl;
	const code = searchParams.get('code');

	if (code) {
		const supabase = await createSupabaseServerClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			return NextResponse.redirect(origin);
		}
	}

	// code がない、または exchange に失敗した場合は /login にリダイレクト
	return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
}
