export function getSupabaseUrl(): string {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!url) {
		throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
	}
	return url;
}

export function getSupabaseAnonKey(): string {
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!key) {
		throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
	}
	return key;
}
