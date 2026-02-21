import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';

export class SignInUseCase {
	constructor(private readonly authGateway: AuthGateway) {}

	async execute(redirectTo: string): Promise<{ url: string }> {
		return this.authGateway.signInWithGoogle(redirectTo);
	}
}
