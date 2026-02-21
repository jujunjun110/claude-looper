import type { AuthGateway } from '@/backend/contexts/auth/domain/gateways/auth.gateway';
import { User } from '@/backend/contexts/auth/domain/models/user.model';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAuthGateway implements AuthGateway {
	constructor(private readonly supabase: SupabaseClient) {}

	async getCurrentUser(): Promise<User | null> {
		const {
			data: { user: supabaseUser },
			error,
		} = await this.supabase.auth.getUser();

		if (error || !supabaseUser) {
			return null;
		}

		const result = User.fromSupabaseUser({
			id: supabaseUser.id,
			email: supabaseUser.email,
			user_metadata: supabaseUser.user_metadata,
			created_at: supabaseUser.created_at,
			updated_at: supabaseUser.updated_at ?? supabaseUser.created_at,
		});

		if (!result.success) {
			return null;
		}

		return result.value;
	}

	async signInWithGoogle(redirectTo: string): Promise<{ url: string }> {
		const { data, error } = await this.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo },
		});

		if (error) {
			throw new Error(`Google sign-in failed: ${error.message}`);
		}

		if (!data.url) {
			throw new Error('Google sign-in failed: no redirect URL returned');
		}

		return { url: data.url };
	}

	async signOut(): Promise<void> {
		const { error } = await this.supabase.auth.signOut();

		if (error) {
			throw new Error(`Sign-out failed: ${error.message}`);
		}
	}
}
