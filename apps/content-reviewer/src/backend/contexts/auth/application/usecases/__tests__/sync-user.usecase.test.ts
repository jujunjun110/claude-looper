import { SyncUserUseCase } from '@/backend/contexts/auth/application/usecases/sync-user.usecase';
import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import type { UserRepository } from '@/backend/contexts/auth/domain/gateways/user.repository';
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

function createMockUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
	return {
		findById: vi.fn().mockResolvedValue(null),
		findByEmail: vi.fn().mockResolvedValue(null),
		upsert: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe('SyncUserUseCase', () => {
	it('should upsert the current user and return it', async () => {
		const user = User.createDummy();
		const authGateway = createMockAuthGateway({
			getCurrentUser: vi.fn().mockResolvedValue(user),
		});
		const userRepository = createMockUserRepository();
		const useCase = new SyncUserUseCase(authGateway, userRepository);

		const result = await useCase.execute();

		expect(result).toBe(user);
		expect(authGateway.getCurrentUser).toHaveBeenCalledOnce();
		expect(userRepository.upsert).toHaveBeenCalledWith(user);
	});

	it('should return null when no user is authenticated', async () => {
		const authGateway = createMockAuthGateway();
		const userRepository = createMockUserRepository();
		const useCase = new SyncUserUseCase(authGateway, userRepository);

		const result = await useCase.execute();

		expect(result).toBeNull();
		expect(authGateway.getCurrentUser).toHaveBeenCalledOnce();
		expect(userRepository.upsert).not.toHaveBeenCalled();
	});

	it('should propagate errors from upsert', async () => {
		const user = User.createDummy();
		const authGateway = createMockAuthGateway({
			getCurrentUser: vi.fn().mockResolvedValue(user),
		});
		const userRepository = createMockUserRepository({
			upsert: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new SyncUserUseCase(authGateway, userRepository);

		await expect(useCase.execute()).rejects.toThrow('DB error');
	});
});
