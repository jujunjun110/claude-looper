import type { User } from '@/backend/contexts/auth/domain/models/user.model';

export interface AuthGateway {
	getCurrentUser(): Promise<User | null>;
	signInWithGoogle(redirectTo: string): Promise<{ url: string }>;
	signOut(): Promise<void>;
}
