import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');

	if (code) {
		const supabase = await createSupabaseServerClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			return NextResponse.redirect(`${origin}/`);
		}
	}

	return NextResponse.redirect(`${origin}/login`);
}
