import { describe, expect, it, vi } from 'vitest';

const mockClient = { auth: {} };
const mockCookieStore = {
	getAll: vi.fn(() => [{ name: 'sb-token', value: 'abc' }]),
	set: vi.fn(),
};

vi.mock('next/headers', () => ({
	cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn(() => mockClient),
}));

vi.mock('@/lib/env', () => ({
	getSupabaseUrl: () => 'https://test.supabase.co',
	getSupabaseAnonKey: () => 'test-anon-key',
}));

describe('createSupabaseServerClient', () => {
	it('creates a server client with cookie handlers', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		const { createSupabaseServerClient } = await import(
			'@/backend/contexts/shared/infrastructure/db/supabase-server-client'
		);

		const client = await createSupabaseServerClient();

		expect(createServerClient).toHaveBeenCalledWith(
			'https://test.supabase.co',
			'test-anon-key',
			expect.objectContaining({
				cookies: expect.objectContaining({
					getAll: expect.any(Function),
					setAll: expect.any(Function),
				}),
			}),
		);
		expect(client).toBe(mockClient);
	});

	it('getAll delegates to cookieStore.getAll', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		await import('@/backend/contexts/shared/infrastructure/db/supabase-server-client');

		const options = vi.mocked(createServerClient).mock.calls[0]?.[2];
		const result = options?.cookies.getAll();

		expect(result).toEqual([{ name: 'sb-token', value: 'abc' }]);
	});

	it('setAll delegates to cookieStore.set for each cookie', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		await import('@/backend/contexts/shared/infrastructure/db/supabase-server-client');

		const options = vi.mocked(createServerClient).mock.calls[0]?.[2];
		options?.cookies.setAll?.([
			{ name: 'a', value: '1', options: { path: '/' } },
			{ name: 'b', value: '2', options: { path: '/' } },
		]);

		expect(mockCookieStore.set).toHaveBeenCalledWith('a', '1', { path: '/' });
		expect(mockCookieStore.set).toHaveBeenCalledWith('b', '2', { path: '/' });
	});

	it('setAll silently ignores errors (Server Component context)', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		await import('@/backend/contexts/shared/infrastructure/db/supabase-server-client');

		mockCookieStore.set.mockImplementation(() => {
			throw new Error('Cookies can only be modified in Server Actions or Route Handlers');
		});

		const options = vi.mocked(createServerClient).mock.calls[0]?.[2];

		expect(() => {
			options?.cookies.setAll?.([{ name: 'a', value: '1', options: {} }]);
		}).not.toThrow();
	});
});
