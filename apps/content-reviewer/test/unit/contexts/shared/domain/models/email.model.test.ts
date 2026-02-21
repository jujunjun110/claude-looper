import { Email } from '@/backend/contexts/shared/domain/models/email.model';
import { describe, expect, it } from 'vitest';

describe('Email', () => {
	describe('create', () => {
		it('should create a valid email', () => {
			const result = Email.create('user@example.com');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.value).toBe('user@example.com');
			}
		});

		it('should normalize to lowercase', () => {
			const result = Email.create('User@Example.COM');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.value).toBe('user@example.com');
			}
		});

		it('should trim whitespace', () => {
			const result = Email.create('  user@example.com  ');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.value).toBe('user@example.com');
			}
		});

		it('should reject empty string', () => {
			const result = Email.create('');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Email cannot be empty');
			}
		});

		it('should reject whitespace-only string', () => {
			const result = Email.create('   ');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Email cannot be empty');
			}
		});

		it('should reject invalid format without @', () => {
			const result = Email.create('invalid-email');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Invalid email format');
			}
		});

		it('should reject invalid format without domain', () => {
			const result = Email.create('user@');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Invalid email format');
			}
		});

		it('should reject invalid format without TLD', () => {
			const result = Email.create('user@example');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Invalid email format');
			}
		});
	});

	describe('equals', () => {
		it('should return true for same email', () => {
			const result1 = Email.create('user@example.com');
			const result2 = Email.create('user@example.com');
			if (result1.success && result2.success) {
				expect(result1.value.equals(result2.value)).toBe(true);
			}
		});

		it('should return true for same email with different casing', () => {
			const result1 = Email.create('User@Example.com');
			const result2 = Email.create('user@example.com');
			if (result1.success && result2.success) {
				expect(result1.value.equals(result2.value)).toBe(true);
			}
		});

		it('should return false for different emails', () => {
			const result1 = Email.create('user1@example.com');
			const result2 = Email.create('user2@example.com');
			if (result1.success && result2.success) {
				expect(result1.value.equals(result2.value)).toBe(false);
			}
		});
	});

	describe('toString', () => {
		it('should return the email string', () => {
			const result = Email.create('user@example.com');
			if (result.success) {
				expect(result.value.toString()).toBe('user@example.com');
			}
		});
	});
});
