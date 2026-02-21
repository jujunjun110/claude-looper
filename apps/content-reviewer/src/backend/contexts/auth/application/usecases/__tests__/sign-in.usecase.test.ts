import { SignInUseCase } from '@/backend/contexts/auth/application/usecases/sign-in.usecase';
import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import { describe, expect, it, vi } from 'vitest';

function createMockAuthGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
	return {
		getCurrentUser: vi.fn().mockResolvedValue(null),
		signInWithGoogle: vi.fn().mockResolvedValue({ url: 'https://accounts.google.com/oauth' }),
		signOut: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe('SignInUseCase', () => {
	it('should return the OAuth redirect URL', async () => {
		const authGateway = createMockAuthGateway();
		const useCase = new SignInUseCase(authGateway);

		const result = await useCase.execute('http://localhost:3000/auth/callback');

		expect(result).toEqual({ url: 'https://accounts.google.com/oauth' });
		expect(authGateway.signInWithGoogle).toHaveBeenCalledWith(
			'http://localhost:3000/auth/callback',
		);
	});

	it('should propagate errors from the auth gateway', async () => {
		const authGateway = createMockAuthGateway({
			signInWithGoogle: vi.fn().mockRejectedValue(new Error('OAuth failed')),
		});
		const useCase = new SignInUseCase(authGateway);

		await expect(useCase.execute('http://localhost:3000/auth/callback')).rejects.toThrow(
			'OAuth failed',
		);
	});
});
