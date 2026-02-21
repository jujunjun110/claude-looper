import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

describe('UserId', () => {
	it('should create a UserId from a valid string', () => {
		const id = createUserId('abc-123');
		expect(id).toBe('abc-123');
	});

	it('should create a UserId from a UUID', () => {
		const id = createUserId('550e8400-e29b-41d4-a716-446655440000');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('should throw on empty string', () => {
		expect(() => createUserId('')).toThrow('UserId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createUserId('   ')).toThrow('UserId cannot be empty');
	});
});
