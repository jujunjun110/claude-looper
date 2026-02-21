import { describe, expect, it, vi } from 'vitest';

const mockClient = { auth: {} };

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn(() => mockClient),
}));

vi.mock('@/lib/env', () => ({
	getSupabaseUrl: () => 'https://test.supabase.co',
	getSupabaseAnonKey: () => 'test-anon-key',
}));

function createMockRequest() {
	const cookies = new Map<string, string>();
	return {
		cookies: {
			getAll: vi.fn(() => Array.from(cookies.entries()).map(([name, value]) => ({ name, value }))),
			set: vi.fn((name: string, value: string) => {
				cookies.set(name, value);
			}),
		},
	};
}

function createMockResponse() {
	return {
		cookies: {
			set: vi.fn(),
		},
	};
}

describe('createSupabaseMiddlewareClient', () => {
	it('creates a client and returns it with the response', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		const { createSupabaseMiddlewareClient } = await import(
			'@/backend/contexts/shared/infrastructure/db/supabase-middleware-client'
		);

		const request = createMockRequest();
		const response = createMockResponse();

		// biome-ignore lint/suspicious/noExplicitAny: test mock
		const result = createSupabaseMiddlewareClient(request as any, response as any);

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
		expect(result.supabase).toBe(mockClient);
		expect(result.response).toBe(response);
	});

	it('getAll delegates to request.cookies.getAll', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		const { createSupabaseMiddlewareClient } = await import(
			'@/backend/contexts/shared/infrastructure/db/supabase-middleware-client'
		);

		const request = createMockRequest();
		const response = createMockResponse();

		// biome-ignore lint/suspicious/noExplicitAny: test mock
		createSupabaseMiddlewareClient(request as any, response as any);

		const lastCall = vi.mocked(createServerClient).mock.lastCall;
		const options = lastCall?.[2];
		options?.cookies.getAll();

		expect(request.cookies.getAll).toHaveBeenCalled();
	});

	it('setAll sets cookies on both request and response', async () => {
		const { createServerClient } = await import('@supabase/ssr');
		const { createSupabaseMiddlewareClient } = await import(
			'@/backend/contexts/shared/infrastructure/db/supabase-middleware-client'
		);

		const request = createMockRequest();
		const response = createMockResponse();

		// biome-ignore lint/suspicious/noExplicitAny: test mock
		createSupabaseMiddlewareClient(request as any, response as any);

		const lastCall = vi.mocked(createServerClient).mock.lastCall;
		const options = lastCall?.[2];
		options?.cookies.setAll?.([{ name: 'token', value: 'xyz', options: { path: '/' } }]);

		expect(request.cookies.set).toHaveBeenCalledWith('token', 'xyz');
		expect(response.cookies.set).toHaveBeenCalledWith('token', 'xyz', { path: '/' });
	});
});
