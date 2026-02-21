import { afterEach, describe, expect, it, vi } from 'vitest';

describe('env', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe('getSupabaseUrl', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
			const { getSupabaseUrl } = await import('@/lib/env');
			expect(getSupabaseUrl()).toBe('https://test.supabase.co');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
			const { getSupabaseUrl } = await import('@/lib/env');
			expect(() => getSupabaseUrl()).toThrow(
				'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL',
			);
		});
	});

	describe('getSupabaseAnonKey', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
			const { getSupabaseAnonKey } = await import('@/lib/env');
			expect(getSupabaseAnonKey()).toBe('test-anon-key');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
			const { getSupabaseAnonKey } = await import('@/lib/env');
			expect(() => getSupabaseAnonKey()).toThrow(
				'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY',
			);
		});
	});
});
