import type { Email } from '@/backend/contexts/shared/domain/models/email.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export interface User {
	readonly id: UserId;
	readonly email: Email;
	readonly name: string;
	readonly avatarUrl: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}
