import { createSupabaseMiddlewareClient } from '@/backend/contexts/shared/infrastructure/db/supabase-middleware-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth/callback'];
const STATIC_PREFIXES = ['/_next/static', '/_next/image'];
const STATIC_FILES = ['/favicon.ico'];

function isPublicPath(pathname: string): boolean {
	return (
		PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
		STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
		STATIC_FILES.includes(pathname)
	);
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	// 開発環境では認証チェックをスキップし、ダミーユーザーとして通過
	if (process.env.NODE_ENV === 'development') {
		return NextResponse.next();
	}

	const response = NextResponse.next({ request });
	const { supabase, response: supabaseResponse } = createSupabaseMiddlewareClient(
		request,
		response,
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = '/login';
		return NextResponse.redirect(loginUrl);
	}

	return supabaseResponse;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
