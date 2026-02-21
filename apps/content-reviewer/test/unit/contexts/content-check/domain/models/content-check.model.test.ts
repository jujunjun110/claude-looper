import { ContentCheck } from '@/backend/contexts/content-check/domain/models/content-check.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

const validId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('user-1');

describe('ContentCheck', () => {
	describe('create', () => {
		it('should throw not implemented', () => {
			expect(() =>
				ContentCheck.create({ id: validId, userId: validUserId, content: 'test content' }),
			).toThrow('not implemented');
		});
	});

	describe('reconstruct', () => {
		it('should throw not implemented', () => {
			expect(() =>
				ContentCheck.reconstruct({
					id: validId,
					userId: validUserId,
					content: 'test content',
					status: 'pending',
					failedReason: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			).toThrow('not implemented');
		});
	});
});
