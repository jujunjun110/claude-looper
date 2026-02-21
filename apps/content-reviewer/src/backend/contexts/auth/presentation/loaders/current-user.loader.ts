import { User } from '@/backend/contexts/auth/domain/models/user.model';
import { createGetCurrentUserUseCase } from '@/backend/contexts/auth/presentation/composition/auth.composition';

export async function loadCurrentUser(): Promise<User | null> {
	if (process.env.NODE_ENV === 'development') {
		return User.createDummy();
	}

	const useCase = await createGetCurrentUserUseCase();
	return useCase.execute();
}
