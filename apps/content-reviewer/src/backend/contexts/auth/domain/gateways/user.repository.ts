import type { User } from '@/backend/contexts/auth/domain/models/user.model';
import type { Email } from '@/backend/contexts/shared/domain/models/email.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export interface UserRepository {
	findById(id: UserId): Promise<User | null>;
	findByEmail(email: Email): Promise<User | null>;
	upsert(user: User): Promise<void>;
}
