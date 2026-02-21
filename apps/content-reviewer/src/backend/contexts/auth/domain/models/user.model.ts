import { Email } from '@/backend/contexts/shared/domain/models/email.model';
import { type UserId, createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';

type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface UserProps {
	readonly id: UserId;
	readonly email: Email;
	readonly name: string;
	readonly avatarUrl: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface SupabaseUser {
	readonly id: string;
	readonly email?: string;
	readonly user_metadata: {
		readonly full_name?: string;
		readonly name?: string;
		readonly avatar_url?: string;
	};
	readonly created_at: string;
	readonly updated_at: string;
}

export class User {
	readonly id: UserId;
	readonly email: Email;
	readonly name: string;
	readonly avatarUrl: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	private constructor(props: UserProps) {
		this.id = props.id;
		this.email = props.email;
		this.name = props.name;
		this.avatarUrl = props.avatarUrl;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(props: {
		id: string;
		email: string;
		name: string;
		avatarUrl?: string | null;
		createdAt?: Date;
		updatedAt?: Date;
	}): Result<User, string> {
		const userId = createUserId(props.id);

		const emailResult = Email.create(props.email);
		if (!emailResult.success) {
			return { success: false, error: emailResult.error };
		}

		if (!props.name || props.name.trim().length === 0) {
			return { success: false, error: 'User name cannot be empty' };
		}

		const now = new Date();
		return {
			success: true,
			value: new User({
				id: userId,
				email: emailResult.value,
				name: props.name.trim(),
				avatarUrl: props.avatarUrl ?? null,
				createdAt: props.createdAt ?? now,
				updatedAt: props.updatedAt ?? now,
			}),
		};
	}

	static fromSupabaseUser(supabaseUser: SupabaseUser): Result<User, string> {
		if (!supabaseUser.email) {
			return { success: false, error: 'Supabase user has no email' };
		}

		const name =
			supabaseUser.user_metadata.full_name ?? supabaseUser.user_metadata.name ?? supabaseUser.email;

		return User.create({
			id: supabaseUser.id,
			email: supabaseUser.email,
			name,
			avatarUrl: supabaseUser.user_metadata.avatar_url ?? null,
			createdAt: new Date(supabaseUser.created_at),
			updatedAt: new Date(supabaseUser.updated_at),
		});
	}

	static createDummy(
		overrides: Partial<{
			id: string;
			email: string;
			name: string;
			avatarUrl: string | null;
			createdAt: Date;
			updatedAt: Date;
		}> = {},
	): User {
		const result = User.create({
			id: overrides.id ?? '00000000-0000-0000-0000-000000000000',
			email: overrides.email ?? 'dummy@example.com',
			name: overrides.name ?? 'Dummy User',
			avatarUrl: overrides.avatarUrl !== undefined ? overrides.avatarUrl : null,
			createdAt: overrides.createdAt ?? new Date('2025-01-01T00:00:00Z'),
			updatedAt: overrides.updatedAt ?? new Date('2025-01-01T00:00:00Z'),
		});

		if (!result.success) {
			throw new Error(`Failed to create dummy user: ${result.error}`);
		}

		return result.value;
	}
}
