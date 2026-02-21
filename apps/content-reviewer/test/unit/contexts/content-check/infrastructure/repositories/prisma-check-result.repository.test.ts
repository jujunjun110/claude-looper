import {
	CheckResult,
	type CheckType,
	type Severity,
} from '@/backend/contexts/content-check/domain/models/check-result.model';
import { PrismaCheckResultRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-check-result.repository';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type {
	CheckResult as PrismaCheckResult,
	CheckType as PrismaCheckType,
	PrismaClient,
	Severity as PrismaSeverity,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const validResultId = createCheckResultId('550e8400-e29b-41d4-a716-446655440003');
const validSegmentId = createContentSegmentId('550e8400-e29b-41d4-a716-446655440001');
const validCheckId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
const now = new Date('2024-01-01T00:00:00.000Z');

type PrismaCheckResultWithSegment = PrismaCheckResult & {
	contentSegment: { contentCheckId: string };
};

function makePrismaRecord(
	overrides: Partial<PrismaCheckResultWithSegment> = {},
): PrismaCheckResultWithSegment {
	return {
		id: validResultId as string,
		contentSegmentId: validSegmentId as string,
		checkType: 'fact_check' as PrismaCheckType,
		severity: 'warning' as PrismaSeverity,
		message: 'ファクトチェックの警告',
		suggestion: '修正案',
		metadata: null,
		createdAt: now,
		updatedAt: now,
		contentSegment: { contentCheckId: validCheckId as string },
		...overrides,
	};
}

function makeDomainCheckResult(
	checkType: CheckType = 'fact_check',
	severity: Severity = 'warning',
): CheckResult {
	return Object.assign(Object.create(CheckResult.prototype), {
		id: validResultId,
		segmentId: validSegmentId,
		contentCheckId: validCheckId,
		checkType,
		severity,
		message: 'ファクトチェックの警告',
		suggestion: '修正案',
		createdAt: now,
	}) as CheckResult;
}

function createMockPrisma(checkResultOverrides: Record<string, unknown> = {}): PrismaClient {
	return {
		checkResult: {
			createMany: vi.fn().mockResolvedValue({ count: 0 }),
			findMany: vi.fn().mockResolvedValue([]),
			...checkResultOverrides,
		},
	} as unknown as PrismaClient;
}

describe('PrismaCheckResultRepository', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('saveMany', () => {
		it('should not call prisma when results array is empty', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);

			await repo.saveMany([]);

			expect(prisma.checkResult.createMany).not.toHaveBeenCalled();
		});

		it('should call createMany with correct data', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);
			const result = makeDomainCheckResult();

			await repo.saveMany([result]);

			expect(prisma.checkResult.createMany).toHaveBeenCalledOnce();
			expect(prisma.checkResult.createMany).toHaveBeenCalledWith({
				data: [
					{
						id: validResultId as string,
						contentSegmentId: validSegmentId as string,
						checkType: 'fact_check',
						severity: 'warning',
						message: 'ファクトチェックの警告',
						suggestion: '修正案',
						createdAt: now,
					},
				],
				skipDuplicates: true,
			});
		});

		it('should handle null suggestion', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);
			const result = Object.assign(Object.create(CheckResult.prototype), {
				id: validResultId,
				segmentId: validSegmentId,
				contentCheckId: validCheckId,
				checkType: 'quality' as CheckType,
				severity: 'info' as Severity,
				message: '品質チェック',
				suggestion: null,
				createdAt: now,
			}) as CheckResult;

			await repo.saveMany([result]);

			const call = (prisma.checkResult.createMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.data[0].suggestion).toBeNull();
		});
	});

	describe('findBySegmentId', () => {
		it('should return empty array when no records', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);

			const result = await repo.findBySegmentId(validSegmentId);

			expect(result).toEqual([]);
			expect(prisma.checkResult.findMany).toHaveBeenCalledWith({
				where: { contentSegmentId: validSegmentId as string },
				include: { contentSegment: { select: { contentCheckId: true } } },
			});
		});

		it('should map records to domain models with contentCheckId from segment', async () => {
			const record = makePrismaRecord();
			const mockResult = makeDomainCheckResult();
			vi.spyOn(CheckResult, 'reconstruct').mockReturnValue(mockResult);

			const prisma = createMockPrisma({
				findMany: vi.fn().mockResolvedValue([record]),
			});
			const repo = new PrismaCheckResultRepository(prisma);

			const results = await repo.findBySegmentId(validSegmentId);

			expect(CheckResult.reconstruct).toHaveBeenCalledWith({
				id: validResultId,
				segmentId: validSegmentId,
				contentCheckId: validCheckId,
				checkType: 'fact_check',
				severity: 'warning',
				message: 'ファクトチェックの警告',
				suggestion: '修正案',
				createdAt: now,
			});
			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockResult);
		});
	});

	describe('findByContentCheckId', () => {
		it('should return empty array when no records', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);

			const result = await repo.findByContentCheckId(validCheckId);

			expect(result).toEqual([]);
			expect(prisma.checkResult.findMany).toHaveBeenCalledWith({
				where: { contentSegment: { contentCheckId: validCheckId as string } },
				include: { contentSegment: { select: { contentCheckId: true } } },
			});
		});

		it('should filter by nested contentSegment.contentCheckId', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaCheckResultRepository(prisma);

			await repo.findByContentCheckId(validCheckId);

			expect(prisma.checkResult.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { contentSegment: { contentCheckId: validCheckId as string } },
				}),
			);
		});

		it('should map records to domain models', async () => {
			const record = makePrismaRecord();
			const mockResult = makeDomainCheckResult();
			vi.spyOn(CheckResult, 'reconstruct').mockReturnValue(mockResult);

			const prisma = createMockPrisma({
				findMany: vi.fn().mockResolvedValue([record]),
			});
			const repo = new PrismaCheckResultRepository(prisma);

			const results = await repo.findByContentCheckId(validCheckId);

			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockResult);
		});
	});
});
