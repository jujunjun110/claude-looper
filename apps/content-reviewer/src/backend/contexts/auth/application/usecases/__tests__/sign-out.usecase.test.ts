import { SignOutUseCase } from '@/backend/contexts/auth/application/usecases/sign-out.usecase';
import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import { describe, expect, it, vi } from 'vitest';

function createMockAuthGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
	return {
		getCurrentUser: vi.fn().mockResolvedValue(null),
		signInWithGoogle: vi.fn().mockResolvedValue({ url: 'https://example.com' }),
		signOut: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe('SignOutUseCase', () => {
	it('should call signOut on the auth gateway', async () => {
		const authGateway = createMockAuthGateway();
		const useCase = new SignOutUseCase(authGateway);

		await useCase.execute();

		expect(authGateway.signOut).toHaveBeenCalledOnce();
	});

	it('should propagate errors from the auth gateway', async () => {
		const authGateway = createMockAuthGateway({
			signOut: vi.fn().mockRejectedValue(new Error('Sign-out failed')),
		});
		const useCase = new SignOutUseCase(authGateway);

		await expect(useCase.execute()).rejects.toThrow('Sign-out failed');
	});
});
