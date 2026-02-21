import { Email } from '@/backend/contexts/shared/domain/models/email.model';
import { type UserId, createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';

type Result<T, E> = { success: true; value: T } | { success: false; error: E };

/**
 * Supabase Auth ユーザーから受け取る最小限の型定義。
 * ドメイン層を @supabase/supabase-js に依存させないために独自定義する。
 */
export interface SupabaseUserLike {
	readonly id: string;
	readonly email?: string;
	readonly user_metadata?: {
		full_name?: string;
		name?: string;
		avatar_url?: string;
	};
	readonly created_at?: string;
	readonly updated_at?: string;
}

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';
const DUMMY_EMAIL = 'dummy@example.com';

export class User {
	private constructor(
		readonly id: UserId,
		readonly email: Email,
		readonly name: string,
		readonly avatarUrl: string | null,
		readonly createdAt: Date,
		readonly updatedAt: Date,
	) {}

	static create(
		id: string,
		email: string,
		name: string,
		avatarUrl?: string | null,
	): Result<User, string> {
		const userId = createUserId(id);

		const emailResult = Email.create(email);
		if (!emailResult.success) {
			return { success: false, error: emailResult.error };
		}

		if (name.trim().length === 0) {
			return { success: false, error: 'User name cannot be empty' };
		}

		const now = new Date();
		return {
			success: true,
			value: new User(userId, emailResult.value, name.trim(), avatarUrl ?? null, now, now),
		};
	}

	static fromSupabaseUser(supabaseUser: SupabaseUserLike): Result<User, string> {
		const userId = createUserId(supabaseUser.id);

		const rawEmail = supabaseUser.email;
		if (!rawEmail) {
			return { success: false, error: 'Supabase user has no email' };
		}

		const emailResult = Email.create(rawEmail);
		if (!emailResult.success) {
			return { success: false, error: emailResult.error };
		}

		const metadata = supabaseUser.user_metadata;
		const name = metadata?.full_name ?? metadata?.name ?? rawEmail;

		const avatarUrl = metadata?.avatar_url ?? null;
		const createdAt = supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date();
		const updatedAt = supabaseUser.updated_at ? new Date(supabaseUser.updated_at) : new Date();

		return {
			success: true,
			value: new User(userId, emailResult.value, name, avatarUrl, createdAt, updatedAt),
		};
	}

	static createDummy(): User {
		const userId = createUserId(DUMMY_USER_ID);
		const emailResult = Email.create(DUMMY_EMAIL);
		if (!emailResult.success) {
			throw new Error(`Failed to create dummy email: ${emailResult.error}`);
		}

		const now = new Date();
		return new User(userId, emailResult.value, 'Dummy User', null, now, now);
	}
}
