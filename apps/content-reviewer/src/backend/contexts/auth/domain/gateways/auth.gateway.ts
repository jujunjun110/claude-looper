import type { User } from '@/backend/contexts/auth/domain/models/user.model';

export interface AuthGateway {
	getCurrentUser(): Promise<User | null>;
	signInWithGoogle(): Promise<void>;
	signOut(): Promise<void>;
	onAuthStateChange(callback: (user: User | null) => void): () => void;
}
