import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import type { UserRepository } from '@/backend/contexts/auth/domain/gateways/user.repository';
import type { User } from '@/backend/contexts/auth/domain/models/user.model';

export class SyncUserUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly userRepository: UserRepository,
	) {}

	async execute(): Promise<User | null> {
		const user = await this.authGateway.getCurrentUser();

		if (!user) {
			return null;
		}

		await this.userRepository.upsert(user);

		return user;
	}
}
