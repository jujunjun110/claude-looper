import { GetCurrentUserUseCase } from '@/backend/contexts/auth/application/usecases/get-current-user.usecase';
import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import { User } from '@/backend/contexts/auth/domain/models/user.model';
import { describe, expect, it, vi } from 'vitest';

function createMockAuthGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
	return {
		getCurrentUser: vi.fn().mockResolvedValue(null),
		signInWithGoogle: vi.fn().mockResolvedValue({ url: 'https://example.com' }),
		signOut: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe('GetCurrentUserUseCase', () => {
	it('should return the current user when authenticated', async () => {
		const user = User.createDummy();
		const authGateway = createMockAuthGateway({
			getCurrentUser: vi.fn().mockResolvedValue(user),
		});
		const useCase = new GetCurrentUserUseCase(authGateway);

		const result = await useCase.execute();

		expect(result).toBe(user);
		expect(authGateway.getCurrentUser).toHaveBeenCalledOnce();
	});

	it('should return null when not authenticated', async () => {
		const authGateway = createMockAuthGateway();
		const useCase = new GetCurrentUserUseCase(authGateway);

		const result = await useCase.execute();

		expect(result).toBeNull();
		expect(authGateway.getCurrentUser).toHaveBeenCalledOnce();
	});
});
