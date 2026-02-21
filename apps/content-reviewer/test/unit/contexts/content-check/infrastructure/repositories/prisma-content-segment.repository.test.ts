import { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { PrismaContentSegmentRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-content-segment.repository';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type { PrismaClient, ContentSegment as PrismaContentSegment } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const validSegmentId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
const now = new Date('2024-01-01T00:00:00.000Z');

function makePrismaRecord(overrides: Partial<PrismaContentSegment> = {}): PrismaContentSegment {
	return {
		id: validSegmentId as string,
		contentCheckId: validCheckId as string,
		segmentIndex: 0,
		text: 'セグメントテキスト',
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makeDomainSegment(index = 0): ContentSegment {
	return Object.assign(Object.create(ContentSegment.prototype), {
		id: validSegmentId,
		contentCheckId: validCheckId,
		text: 'セグメントテキスト',
		segmentIndex: index,
		createdAt: now,
	}) as ContentSegment;
}

function createMockPrisma(contentSegmentOverrides: Record<string, unknown> = {}): PrismaClient {
	return {
		contentSegment: {
			createMany: vi.fn().mockResolvedValue({ count: 0 }),
			findMany: vi.fn().mockResolvedValue([]),
			...contentSegmentOverrides,
		},
	} as unknown as PrismaClient;
}

describe('PrismaContentSegmentRepository', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('saveMany', () => {
		it('should not call prisma when segments array is empty', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentSegmentRepository(prisma);

			await repo.saveMany([]);

			expect(prisma.contentSegment.createMany).not.toHaveBeenCalled();
		});

		it('should call createMany with correct data', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentSegmentRepository(prisma);
			const segment = makeDomainSegment(0);

			await repo.saveMany([segment]);

			expect(prisma.contentSegment.createMany).toHaveBeenCalledOnce();
			expect(prisma.contentSegment.createMany).toHaveBeenCalledWith({
				data: [
					{
						id: validSegmentId as string,
						contentCheckId: validCheckId as string,
						segmentIndex: 0,
						text: 'セグメントテキスト',
						createdAt: now,
					},
				],
				skipDuplicates: true,
			});
		});

		it('should handle multiple segments', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentSegmentRepository(prisma);
			const segment1 = makeDomainSegment(0);
			const segment2 = Object.assign(Object.create(ContentSegment.prototype), {
				id: createContentSegmentId('550e8400-e29b-41d4-a716-446655440002'),
				contentCheckId: validCheckId,
				text: '2番目のセグメント',
				segmentIndex: 1,
				createdAt: now,
			}) as ContentSegment;

			await repo.saveMany([segment1, segment2]);

			const call = (prisma.contentSegment.createMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.data).toHaveLength(2);
			expect(call.data[0].segmentIndex).toBe(0);
			expect(call.data[1].segmentIndex).toBe(1);
		});
	});

	describe('findByContentCheckId', () => {
		it('should return empty array when no records', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentSegmentRepository(prisma);

			const result = await repo.findByContentCheckId(validCheckId);

			expect(result).toEqual([]);
			expect(prisma.contentSegment.findMany).toHaveBeenCalledWith({
				where: { contentCheckId: validCheckId as string },
				orderBy: { segmentIndex: 'asc' },
			});
		});

		it('should map records to domain models', async () => {
			const record = makePrismaRecord();
			const mockSegment = makeDomainSegment();
			vi.spyOn(ContentSegment, 'reconstruct').mockReturnValue(mockSegment);

			const prisma = createMockPrisma({
				findMany: vi.fn().mockResolvedValue([record]),
			});
			const repo = new PrismaContentSegmentRepository(prisma);

			const result = await repo.findByContentCheckId(validCheckId);

			expect(ContentSegment.reconstruct).toHaveBeenCalledWith({
				id: validSegmentId,
				contentCheckId: validCheckId,
				text: 'セグメントテキスト',
				segmentIndex: 0,
				createdAt: now,
			});
			expect(result).toHaveLength(1);
			expect(result[0]).toBe(mockSegment);
		});

		it('should order results by segmentIndex asc', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentSegmentRepository(prisma);

			await repo.findByContentCheckId(validCheckId);

			expect(prisma.contentSegment.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					orderBy: { segmentIndex: 'asc' },
				}),
			);
		});
	});
});
