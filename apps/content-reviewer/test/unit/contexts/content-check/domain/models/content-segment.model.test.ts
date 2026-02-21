import { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { describe, expect, it } from 'vitest';

const validId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validContentCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');

describe('ContentSegment', () => {
	describe('create', () => {
		it('should create a ContentSegment with valid props', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: 'セグメントのテキスト',
				segmentIndex: 0,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe(validId);
				expect(result.value.contentCheckId).toBe(validContentCheckId);
				expect(result.value.text).toBe('セグメントのテキスト');
				expect(result.value.segmentIndex).toBe(0);
				expect(result.value.createdAt).toBeInstanceOf(Date);
			}
		});

		it('should create a ContentSegment with non-zero segmentIndex', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: 'テキスト',
				segmentIndex: 5,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.segmentIndex).toBe(5);
			}
		});

		it('should fail when text is empty', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: '',
				segmentIndex: 0,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Segment text cannot be empty');
			}
		});

		it('should fail when text is whitespace only', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: '   ',
				segmentIndex: 0,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Segment text cannot be empty');
			}
		});

		it('should fail when segmentIndex is negative', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: 'テキスト',
				segmentIndex: -1,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Segment index must be a non-negative integer');
			}
		});

		it('should fail when segmentIndex is not an integer', () => {
			const result = ContentSegment.create({
				id: validId,
				contentCheckId: validContentCheckId,
				text: 'テキスト',
				segmentIndex: 1.5,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Segment index must be a non-negative integer');
			}
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a ContentSegment from props', () => {
			const now = new Date();
			const segment = ContentSegment.reconstruct({
				id: validId,
				contentCheckId: validContentCheckId,
				text: 'segment text',
				segmentIndex: 2,
				createdAt: now,
			});

			expect(segment.id).toBe(validId);
			expect(segment.contentCheckId).toBe(validContentCheckId);
			expect(segment.text).toBe('segment text');
			expect(segment.segmentIndex).toBe(2);
			expect(segment.createdAt).toBe(now);
		});
	});
});
