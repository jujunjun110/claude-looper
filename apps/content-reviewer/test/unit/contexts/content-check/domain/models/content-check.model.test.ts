import { ContentCheck } from '@/backend/contexts/content-check/domain/models/content-check.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

const validId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('user-1');

describe('ContentCheck', () => {
	describe('create', () => {
		it('should create a ContentCheck with valid content', () => {
			const result = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'テスト本文',
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe(validId);
				expect(result.value.userId).toBe(validUserId);
				expect(result.value.content).toBe('テスト本文');
				expect(result.value.status).toBe('pending');
				expect(result.value.failedReason).toBeNull();
				expect(result.value.createdAt).toBeInstanceOf(Date);
				expect(result.value.updatedAt).toBeInstanceOf(Date);
			}
		});

		it('should fail when content is empty', () => {
			const result = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: '',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Content cannot be empty');
			}
		});

		it('should fail when content is whitespace only', () => {
			const result = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: '   ',
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Content cannot be empty');
			}
		});

		it('should fail when content exceeds 30000 characters', () => {
			const result = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'a'.repeat(30001),
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Content cannot exceed 30000 characters');
			}
		});

		it('should succeed when content is exactly 30000 characters', () => {
			const result = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'a'.repeat(30000),
			});

			expect(result.success).toBe(true);
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a ContentCheck from props', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test content',
				status: 'pending',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			expect(check.id).toBe(validId);
			expect(check.userId).toBe(validUserId);
			expect(check.content).toBe('test content');
			expect(check.status).toBe('pending');
			expect(check.failedReason).toBeNull();
			expect(check.createdAt).toBe(now);
			expect(check.updatedAt).toBe(now);
		});

		it('should reconstruct with completed status', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test content',
				status: 'completed',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			expect(check.status).toBe('completed');
		});
	});

	describe('startProcessing', () => {
		it('should transition from pending to processing', () => {
			const createResult = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'テスト本文',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const result = createResult.value.startProcessing();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.status).toBe('processing');
				expect(result.value.id).toBe(validId);
				expect(result.value.content).toBe('テスト本文');
			}
		});

		it('should fail when status is already processing', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'processing',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.startProcessing();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('processing');
			}
		});

		it('should fail when status is completed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'completed',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.startProcessing();

			expect(result.success).toBe(false);
		});
	});

	describe('complete', () => {
		it('should transition from processing to completed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'processing',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.complete();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.status).toBe('completed');
			}
		});

		it('should fail when status is pending', () => {
			const createResult = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'テスト本文',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const result = createResult.value.complete();

			expect(result.success).toBe(false);
		});

		it('should fail when status is already completed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'completed',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.complete();

			expect(result.success).toBe(false);
		});
	});

	describe('fail', () => {
		it('should transition from pending to failed', () => {
			const createResult = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'テスト本文',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const result = createResult.value.fail('Something went wrong');

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.status).toBe('failed');
				expect(result.value.failedReason).toBe('Something went wrong');
			}
		});

		it('should transition from processing to failed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'processing',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.fail('Network error');

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.status).toBe('failed');
				expect(result.value.failedReason).toBe('Network error');
			}
		});

		it('should fail without a reason', () => {
			const createResult = ContentCheck.create({
				id: validId,
				userId: validUserId,
				content: 'テスト本文',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const result = createResult.value.fail();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.status).toBe('failed');
				expect(result.value.failedReason).toBeNull();
			}
		});

		it('should fail when status is already completed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'completed',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});

			const result = check.fail('error');

			expect(result.success).toBe(false);
		});

		it('should fail when status is already failed', () => {
			const now = new Date();
			const check = ContentCheck.reconstruct({
				id: validId,
				userId: validUserId,
				content: 'test',
				status: 'failed',
				failedReason: 'previous error',
				createdAt: now,
				updatedAt: now,
			});

			const result = check.fail('new error');

			expect(result.success).toBe(false);
		});
	});
});
