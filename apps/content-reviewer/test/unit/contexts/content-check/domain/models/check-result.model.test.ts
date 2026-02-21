import { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { describe, expect, it } from 'vitest';

const validId = createCheckResultId('550e8400-e29b-41d4-a716-446655440002');
const validSegmentId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validContentCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');

describe('CheckResult', () => {
	describe('create', () => {
		it('should throw not implemented', () => {
			expect(() =>
				CheckResult.create({
					id: validId,
					segmentId: validSegmentId,
					contentCheckId: validContentCheckId,
					checkType: 'fact_check',
					severity: 'warning',
					message: 'A factual issue was found',
				}),
			).toThrow('not implemented');
		});
	});

	describe('reconstruct', () => {
		it('should throw not implemented', () => {
			expect(() =>
				CheckResult.reconstruct({
					id: validId,
					segmentId: validSegmentId,
					contentCheckId: validContentCheckId,
					checkType: 'quality',
					severity: 'info',
					message: 'Quality note',
					suggestion: null,
					createdAt: new Date(),
				}),
			).toThrow('not implemented');
		});
	});
});
