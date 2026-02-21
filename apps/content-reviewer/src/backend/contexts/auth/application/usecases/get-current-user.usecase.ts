import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import type { User } from '@/backend/contexts/auth/domain/models/user.model';

export class GetCurrentUserUseCase {
	constructor(private readonly authGateway: AuthGateway) {}

	async execute(): Promise<User | null> {
		return this.authGateway.getCurrentUser();
	}
}
