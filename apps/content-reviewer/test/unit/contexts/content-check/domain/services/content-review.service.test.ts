import { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';
import { ContentReviewService } from '@/backend/contexts/content-check/domain/services/content-review.service';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { describe, expect, it } from 'vitest';

const validSegmentId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validContentCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');

function makeCheckResult(severity: 'info' | 'warning' | 'error', index: number): CheckResult {
	const id = createCheckResultId(`550e8400-e29b-41d4-a716-44665544000${index}`);
	const result = CheckResult.create({
		id,
		segmentId: validSegmentId,
		contentCheckId: validContentCheckId,
		checkType: 'quality',
		severity,
		message: `test message ${index}`,
	});
	if (!result.success) throw new Error('Failed to create CheckResult');
	return result.value;
}

describe('ContentReviewService', () => {
	describe('summarize', () => {
		it('should return zero counts when results are empty', () => {
			const service = new ContentReviewService();
			const summary = service.summarize([]);

			expect(summary).toEqual({ error: 0, warning: 0, info: 0 });
		});

		it('should count severities correctly', () => {
			const service = new ContentReviewService();
			const results = [
				makeCheckResult('error', 0),
				makeCheckResult('error', 1),
				makeCheckResult('warning', 2),
				makeCheckResult('info', 3),
				makeCheckResult('info', 4),
				makeCheckResult('info', 5),
			];

			const summary = service.summarize(results);

			expect(summary.error).toBe(2);
			expect(summary.warning).toBe(1);
			expect(summary.info).toBe(3);
		});

		it('should return only errors when all results are errors', () => {
			const service = new ContentReviewService();
			const results = [makeCheckResult('error', 0), makeCheckResult('error', 1)];

			const summary = service.summarize(results);

			expect(summary.error).toBe(2);
			expect(summary.warning).toBe(0);
			expect(summary.info).toBe(0);
		});

		it('should return only warnings when all results are warnings', () => {
			const service = new ContentReviewService();
			const results = [makeCheckResult('warning', 0)];

			const summary = service.summarize(results);

			expect(summary.error).toBe(0);
			expect(summary.warning).toBe(1);
			expect(summary.info).toBe(0);
		});

		it('should handle a single info result', () => {
			const service = new ContentReviewService();
			const results = [makeCheckResult('info', 0)];

			const summary = service.summarize(results);

			expect(summary.error).toBe(0);
			expect(summary.warning).toBe(0);
			expect(summary.info).toBe(1);
		});
	});
});
