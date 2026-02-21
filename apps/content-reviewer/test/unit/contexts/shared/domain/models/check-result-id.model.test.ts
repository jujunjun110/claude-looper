import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { describe, expect, it } from 'vitest';

describe('CheckResultId', () => {
	it('should create a CheckResultId from a valid UUID', () => {
		const id = createCheckResultId('550e8400-e29b-41d4-a716-446655440002');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440002');
	});

	it('should create a CheckResultId from a UUID with uppercase letters', () => {
		const id = createCheckResultId('550E8400-E29B-41D4-A716-446655440002');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440002');
	});

	it('should throw on empty string', () => {
		expect(() => createCheckResultId('')).toThrow('CheckResultId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createCheckResultId('   ')).toThrow('CheckResultId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createCheckResultId('not-a-uuid')).toThrow(
			'CheckResultId must be a valid UUID: not-a-uuid',
		);
	});

	it('should throw on UUID with wrong format', () => {
		expect(() => createCheckResultId('550e8400-e29b-41d4-a716')).toThrow(
			'CheckResultId must be a valid UUID',
		);
	});
});
