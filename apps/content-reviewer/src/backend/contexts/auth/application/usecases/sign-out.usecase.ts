import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';

export class SignOutUseCase {
	constructor(private readonly authGateway: AuthGateway) {}

	async execute(): Promise<void> {
		await this.authGateway.signOut();
	}
}
