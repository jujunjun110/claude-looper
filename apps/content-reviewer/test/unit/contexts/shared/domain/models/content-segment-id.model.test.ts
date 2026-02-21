import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { describe, expect, it } from 'vitest';

describe('ContentSegmentId', () => {
	it('should create a ContentSegmentId from a valid UUID', () => {
		const id = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440001');
	});

	it('should create a ContentSegmentId from a UUID with uppercase letters', () => {
		const id = createContentSegmentId('550E8400-E29B-41D4-A716-446655440001');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440001');
	});

	it('should throw on empty string', () => {
		expect(() => createContentSegmentId('')).toThrow('ContentSegmentId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createContentSegmentId('   ')).toThrow('ContentSegmentId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createContentSegmentId('not-a-uuid')).toThrow(
			'ContentSegmentId must be a valid UUID: not-a-uuid',
		);
	});

	it('should throw on UUID with wrong format', () => {
		expect(() => createContentSegmentId('550e8400-e29b-41d4-a716')).toThrow(
			'ContentSegmentId must be a valid UUID',
		);
	});
});
