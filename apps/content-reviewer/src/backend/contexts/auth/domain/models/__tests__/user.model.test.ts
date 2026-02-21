import { User } from '@/backend/contexts/auth/domain/models/user.model';
import type { SupabaseUser } from '@/backend/contexts/auth/domain/models/user.model';
import { describe, expect, it } from 'vitest';

describe('User', () => {
	describe('create', () => {
		it('should create a valid user', () => {
			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				avatarUrl: 'https://example.com/avatar.png',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe('user-123');
				expect(result.value.email.value).toBe('test@example.com');
				expect(result.value.name).toBe('Test User');
				expect(result.value.avatarUrl).toBe('https://example.com/avatar.png');
				expect(result.value.createdAt).toBeInstanceOf(Date);
				expect(result.value.updatedAt).toBeInstanceOf(Date);
			}
		});

		it('should default avatarUrl to null when not provided', () => {
			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should use provided dates', () => {
			const createdAt = new Date('2025-06-01T00:00:00Z');
			const updatedAt = new Date('2025-06-02T00:00:00Z');

			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				createdAt,
				updatedAt,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.createdAt).toBe(createdAt);
				expect(result.value.updatedAt).toBe(updatedAt);
			}
		});

		it('should trim the user name', () => {
			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: '  Test User  ',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('Test User');
			}
		});

		it('should fail with invalid email', () => {
			const result = User.create({
				id: 'user-123',
				email: 'invalid-email',
				name: 'Test User',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Invalid email format');
			}
		});

		it('should fail with empty email', () => {
			const result = User.create({
				id: 'user-123',
				email: '',
				name: 'Test User',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Email cannot be empty');
			}
		});

		it('should fail with empty name', () => {
			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: '',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('User name cannot be empty');
			}
		});

		it('should fail with whitespace-only name', () => {
			const result = User.create({
				id: 'user-123',
				email: 'test@example.com',
				name: '   ',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('User name cannot be empty');
			}
		});

		it('should throw with empty id', () => {
			expect(() =>
				User.create({
					id: '',
					email: 'test@example.com',
					name: 'Test User',
				}),
			).toThrow('UserId cannot be empty');
		});
	});

	describe('createDummy', () => {
		it('should create a dummy user with default values', () => {
			const user = User.createDummy();

			expect(user.id).toBe('dummy-user-id');
			expect(user.email.value).toBe('dummy@example.com');
			expect(user.name).toBe('Dummy User');
			expect(user.avatarUrl).toBeNull();
			expect(user.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
			expect(user.updatedAt).toEqual(new Date('2025-01-01T00:00:00Z'));
		});

		it('should allow overriding individual fields', () => {
			const user = User.createDummy({
				name: 'Custom Name',
				avatarUrl: 'https://example.com/custom.png',
			});

			expect(user.id).toBe('dummy-user-id');
			expect(user.name).toBe('Custom Name');
			expect(user.avatarUrl).toBe('https://example.com/custom.png');
		});

		it('should allow overriding all fields', () => {
			const createdAt = new Date('2025-03-01T00:00:00Z');
			const updatedAt = new Date('2025-03-02T00:00:00Z');

			const user = User.createDummy({
				id: 'custom-id',
				email: 'custom@example.com',
				name: 'Custom User',
				avatarUrl: 'https://example.com/avatar.png',
				createdAt,
				updatedAt,
			});

			expect(user.id).toBe('custom-id');
			expect(user.email.value).toBe('custom@example.com');
			expect(user.name).toBe('Custom User');
			expect(user.avatarUrl).toBe('https://example.com/avatar.png');
			expect(user.createdAt).toBe(createdAt);
			expect(user.updatedAt).toBe(updatedAt);
		});
	});

	describe('fromSupabaseUser', () => {
		it('should create a user from Supabase user with full_name', () => {
			const supabaseUser: SupabaseUser = {
				id: 'supabase-123',
				email: 'user@example.com',
				user_metadata: {
					full_name: 'Supabase User',
					avatar_url: 'https://example.com/avatar.png',
				},
				created_at: '2025-06-01T00:00:00Z',
				updated_at: '2025-06-02T00:00:00Z',
			};

			const result = User.fromSupabaseUser(supabaseUser);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe('supabase-123');
				expect(result.value.email.value).toBe('user@example.com');
				expect(result.value.name).toBe('Supabase User');
				expect(result.value.avatarUrl).toBe('https://example.com/avatar.png');
				expect(result.value.createdAt).toEqual(new Date('2025-06-01T00:00:00Z'));
				expect(result.value.updatedAt).toEqual(new Date('2025-06-02T00:00:00Z'));
			}
		});

		it('should fall back to name when full_name is not available', () => {
			const supabaseUser: SupabaseUser = {
				id: 'supabase-123',
				email: 'user@example.com',
				user_metadata: {
					name: 'Name Only',
				},
				created_at: '2025-06-01T00:00:00Z',
				updated_at: '2025-06-02T00:00:00Z',
			};

			const result = User.fromSupabaseUser(supabaseUser);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('Name Only');
			}
		});

		it('should fall back to email when no name metadata exists', () => {
			const supabaseUser: SupabaseUser = {
				id: 'supabase-123',
				email: 'user@example.com',
				user_metadata: {},
				created_at: '2025-06-01T00:00:00Z',
				updated_at: '2025-06-02T00:00:00Z',
			};

			const result = User.fromSupabaseUser(supabaseUser);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('user@example.com');
			}
		});

		it('should default avatarUrl to null when not in metadata', () => {
			const supabaseUser: SupabaseUser = {
				id: 'supabase-123',
				email: 'user@example.com',
				user_metadata: {
					full_name: 'Test User',
				},
				created_at: '2025-06-01T00:00:00Z',
				updated_at: '2025-06-02T00:00:00Z',
			};

			const result = User.fromSupabaseUser(supabaseUser);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.avatarUrl).toBeNull();
			}
		});

		it('should fail when Supabase user has no email', () => {
			const supabaseUser: SupabaseUser = {
				id: 'supabase-123',
				user_metadata: {
					full_name: 'No Email User',
				},
				created_at: '2025-06-01T00:00:00Z',
				updated_at: '2025-06-02T00:00:00Z',
			};

			const result = User.fromSupabaseUser(supabaseUser);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Supabase user has no email');
			}
		});
	});
});
