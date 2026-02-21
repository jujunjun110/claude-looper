import type { User } from '@/backend/contexts/auth/domain/models/user.model';
import { createGetCurrentUserUseCase } from '@/backend/contexts/auth/presentation/composition/auth.composition';

export async function loadCurrentUser(): Promise<User | null> {
	const useCase = await createGetCurrentUserUseCase();
	return useCase.execute();
}
