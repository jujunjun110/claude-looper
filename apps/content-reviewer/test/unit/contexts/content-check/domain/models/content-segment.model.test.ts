import { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { describe, expect, it } from 'vitest';

const validId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validContentCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');

describe('ContentSegment', () => {
	describe('create', () => {
		it('should throw not implemented', () => {
			expect(() =>
				ContentSegment.create({
					id: validId,
					contentCheckId: validContentCheckId,
					text: 'segment text',
					segmentIndex: 0,
				}),
			).toThrow('not implemented');
		});
	});

	describe('reconstruct', () => {
		it('should throw not implemented', () => {
			expect(() =>
				ContentSegment.reconstruct({
					id: validId,
					contentCheckId: validContentCheckId,
					text: 'segment text',
					segmentIndex: 0,
					createdAt: new Date(),
				}),
			).toThrow('not implemented');
		});
	});
});
