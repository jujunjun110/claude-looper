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
		it('should create a CheckResult with valid props', () => {
			const result = CheckResult.create({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'fact_check',
				severity: 'warning',
				message: 'A factual issue was found',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe(validId);
				expect(result.value.segmentId).toBe(validSegmentId);
				expect(result.value.contentCheckId).toBe(validContentCheckId);
				expect(result.value.checkType).toBe('fact_check');
				expect(result.value.severity).toBe('warning');
				expect(result.value.message).toBe('A factual issue was found');
				expect(result.value.suggestion).toBeNull();
				expect(result.value.createdAt).toBeInstanceOf(Date);
			}
		});

		it('should create a CheckResult with a suggestion', () => {
			const result = CheckResult.create({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'expression_rule',
				severity: 'error',
				message: 'NG表現が含まれています',
				suggestion: '推奨表現に変更してください',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.suggestion).toBe('推奨表現に変更してください');
			}
		});

		it('should create a CheckResult with all check types', () => {
			const checkTypes = [
				'fact_check',
				'knowledge_consistency',
				'expression_rule',
				'risk_assessment',
				'quality',
			] as const;

			for (const checkType of checkTypes) {
				const result = CheckResult.create({
					id: validId,
					segmentId: validSegmentId,
					contentCheckId: validContentCheckId,
					checkType,
					severity: 'info',
					message: 'test message',
				});

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.value.checkType).toBe(checkType);
				}
			}
		});

		it('should create a CheckResult with all severities', () => {
			const severities = ['info', 'warning', 'error'] as const;

			for (const severity of severities) {
				const result = CheckResult.create({
					id: validId,
					segmentId: validSegmentId,
					contentCheckId: validContentCheckId,
					checkType: 'quality',
					severity,
					message: 'test message',
				});

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.value.severity).toBe(severity);
				}
			}
		});

		it('should fail when message is empty', () => {
			const result = CheckResult.create({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'fact_check',
				severity: 'warning',
				message: '',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Message cannot be empty');
			}
		});

		it('should fail when message is whitespace only', () => {
			const result = CheckResult.create({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'fact_check',
				severity: 'warning',
				message: '   ',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Message cannot be empty');
			}
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a CheckResult from props', () => {
			const now = new Date();
			const checkResult = CheckResult.reconstruct({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'quality',
				severity: 'info',
				message: 'Quality note',
				suggestion: null,
				createdAt: now,
			});

			expect(checkResult.id).toBe(validId);
			expect(checkResult.segmentId).toBe(validSegmentId);
			expect(checkResult.contentCheckId).toBe(validContentCheckId);
			expect(checkResult.checkType).toBe('quality');
			expect(checkResult.severity).toBe('info');
			expect(checkResult.message).toBe('Quality note');
			expect(checkResult.suggestion).toBeNull();
			expect(checkResult.createdAt).toBe(now);
		});

		it('should reconstruct a CheckResult with suggestion', () => {
			const now = new Date();
			const checkResult = CheckResult.reconstruct({
				id: validId,
				segmentId: validSegmentId,
				contentCheckId: validContentCheckId,
				checkType: 'expression_rule',
				severity: 'error',
				message: 'NG表現',
				suggestion: '推奨表現',
				createdAt: now,
			});

			expect(checkResult.suggestion).toBe('推奨表現');
		});
	});
});
