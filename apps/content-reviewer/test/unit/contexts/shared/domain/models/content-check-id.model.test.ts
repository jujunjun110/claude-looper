import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { describe, expect, it } from 'vitest';

describe('ContentCheckId', () => {
	it('should create a ContentCheckId from a valid UUID', () => {
		const id = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('should create a ContentCheckId from a UUID with uppercase letters', () => {
		const id = createContentCheckId('550E8400-E29B-41D4-A716-446655440000');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440000');
	});

	it('should throw on empty string', () => {
		expect(() => createContentCheckId('')).toThrow('ContentCheckId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createContentCheckId('   ')).toThrow('ContentCheckId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createContentCheckId('not-a-uuid')).toThrow(
			'ContentCheckId must be a valid UUID: not-a-uuid',
		);
	});

	it('should throw on UUID with wrong format', () => {
		expect(() => createContentCheckId('550e8400-e29b-41d4-a716')).toThrow(
			'ContentCheckId must be a valid UUID',
		);
	});
});
