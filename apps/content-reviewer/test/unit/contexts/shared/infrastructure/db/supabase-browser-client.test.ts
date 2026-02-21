import { describe, expect, it, vi } from 'vitest';

const mockClient = { auth: {} };

vi.mock('@supabase/ssr', () => ({
	createBrowserClient: vi.fn(() => mockClient),
}));

vi.mock('@/lib/env', () => ({
	getSupabaseUrl: () => 'https://test.supabase.co',
	getSupabaseAnonKey: () => 'test-anon-key',
}));

describe('createSupabaseBrowserClient', () => {
	it('calls createBrowserClient with env values', async () => {
		const { createBrowserClient } = await import('@supabase/ssr');
		const { createSupabaseBrowserClient } = await import(
			'@/backend/contexts/shared/infrastructure/db/supabase-browser-client'
		);

		const client = createSupabaseBrowserClient();

		expect(createBrowserClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key');
		expect(client).toBe(mockClient);
	});
});
