import { type SupabaseUserLike, User } from '@/backend/contexts/auth/domain/models/user.model';
import { describe, expect, it } from 'vitest';

describe('User', () => {
	describe('create', () => {
		it('should create a valid user with all fields', () => {
			const result = User.create(
				'abc-123',
				'user@example.com',
				'Test User',
				'https://example.com/avatar.png',
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(String(result.value.id)).toBe('abc-123');
				expect(result.value.email.toString()).toBe('user@example.com');
				expect(result.value.name).toBe('Test User');
				expect(result.value.avatarUrl).toBe('https://example.com/avatar.png');
				expect(result.value.createdAt).toBeInstanceOf(Date);
				expect(result.value.updatedAt).toBeInstanceOf(Date);
			}
		});

		it('should create a user without avatarUrl', () => {
			const result = User.create('abc-123', 'user@example.com', 'Test User');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should create a user with explicit null avatarUrl', () => {
			const result = User.create('abc-123', 'user@example.com', 'Test User', null);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should trim the user name', () => {
			const result = User.create('abc-123', 'user@example.com', '  Test User  ');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('Test User');
			}
		});

		it('should fail with invalid email', () => {
			const result = User.create('abc-123', 'invalid', 'Test User');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Invalid email format');
			}
		});

		it('should fail with empty email', () => {
			const result = User.create('abc-123', '', 'Test User');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Email cannot be empty');
			}
		});

		it('should fail with empty name', () => {
			const result = User.create('abc-123', 'user@example.com', '');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('User name cannot be empty');
			}
		});

		it('should fail with whitespace-only name', () => {
			const result = User.create('abc-123', 'user@example.com', '   ');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('User name cannot be empty');
			}
		});

		it('should throw with empty id', () => {
			expect(() => User.create('', 'user@example.com', 'Test User')).toThrow(
				'UserId cannot be empty',
			);
		});
	});

	describe('fromSupabaseUser', () => {
		const baseSupabaseUser: SupabaseUserLike = {
			id: 'supabase-uuid-123',
			email: 'google@example.com',
			user_metadata: {
				full_name: 'Google User',
				avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
			},
			created_at: '2025-01-15T10:30:00Z',
			updated_at: '2025-06-20T14:00:00Z',
		};

		it('should convert a Supabase user with full metadata', () => {
			const result = User.fromSupabaseUser(baseSupabaseUser);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(String(result.value.id)).toBe('supabase-uuid-123');
				expect(result.value.email.toString()).toBe('google@example.com');
				expect(result.value.name).toBe('Google User');
				expect(result.value.avatarUrl).toBe('https://lh3.googleusercontent.com/photo.jpg');
				expect(result.value.createdAt).toEqual(new Date('2025-01-15T10:30:00Z'));
				expect(result.value.updatedAt).toEqual(new Date('2025-06-20T14:00:00Z'));
			}
		});

		it('should fallback to name when full_name is missing', () => {
			const user: SupabaseUserLike = {
				...baseSupabaseUser,
				user_metadata: { name: 'Fallback Name' },
			};
			const result = User.fromSupabaseUser(user);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('Fallback Name');
			}
		});

		it('should fallback to email when no name is in metadata', () => {
			const user: SupabaseUserLike = {
				...baseSupabaseUser,
				user_metadata: {},
			};
			const result = User.fromSupabaseUser(user);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('google@example.com');
			}
		});

		it('should fallback to email when metadata is undefined', () => {
			const user: SupabaseUserLike = {
				id: 'supabase-uuid-123',
				email: 'user@example.com',
			};
			const result = User.fromSupabaseUser(user);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('user@example.com');
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should set avatarUrl to null when not provided', () => {
			const user: SupabaseUserLike = {
				...baseSupabaseUser,
				user_metadata: { full_name: 'No Avatar User' },
			};
			const result = User.fromSupabaseUser(user);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should use current date when timestamps are missing', () => {
			const before = new Date();
			const user: SupabaseUserLike = {
				id: 'supabase-uuid-123',
				email: 'user@example.com',
			};
			const result = User.fromSupabaseUser(user);
			const after = new Date();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
				expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
			}
		});

		it('should fail when Supabase user has no email', () => {
			const user: SupabaseUserLike = {
				id: 'supabase-uuid-123',
			};
			const result = User.fromSupabaseUser(user);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Supabase user has no email');
			}
		});
	});

	describe('createDummy', () => {
		it('should create a dummy user with fixed values', () => {
			const user = User.createDummy();
			expect(String(user.id)).toBe('00000000-0000-0000-0000-000000000000');
			expect(user.email.toString()).toBe('dummy@example.com');
			expect(user.name).toBe('Dummy User');
			expect(user.avatarUrl).toBeNull();
			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
		});

		it('should create a new instance each call', () => {
			const user1 = User.createDummy();
			const user2 = User.createDummy();
			expect(user1).not.toBe(user2);
		});
	});
});
