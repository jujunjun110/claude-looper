import {
	type CheckStatus,
	ContentCheck,
} from '@/backend/contexts/content-check/domain/models/content-check.model';
import { PrismaContentCheckRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-content-check.repository';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type {
	PrismaClient,
	ContentCheck as PrismaContentCheck,
	Source,
	Status,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const validId = createContentCheckId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');
const now = new Date('2024-01-01T00:00:00.000Z');

function makePrismaRecord(overrides: Partial<PrismaContentCheck> = {}): PrismaContentCheck {
	return {
		id: validId as string,
		userId: validUserId as string,
		source: 'web' as Source,
		originalText: 'テストコンテンツ',
		status: 'pending' as Status,
		slackChannelId: null,
		slackThreadTs: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makeDomainContentCheck(status: CheckStatus = 'pending'): ContentCheck {
	return Object.assign(Object.create(ContentCheck.prototype), {
		id: validId,
		userId: validUserId,
		content: 'テストコンテンツ',
		status,
		failedReason: null,
		createdAt: now,
		updatedAt: now,
	}) as ContentCheck;
}

function createMockPrisma(contentCheckOverrides: Record<string, unknown> = {}): PrismaClient {
	return {
		contentCheck: {
			upsert: vi.fn().mockResolvedValue(undefined),
			findUnique: vi.fn().mockResolvedValue(null),
			findMany: vi.fn().mockResolvedValue([]),
			...contentCheckOverrides,
		},
	} as unknown as PrismaClient;
}

describe('PrismaContentCheckRepository', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('save', () => {
		it('should call prisma.contentCheck.upsert with correct data', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);
			const contentCheck = makeDomainContentCheck();

			await repo.save(contentCheck);

			expect(prisma.contentCheck.upsert).toHaveBeenCalledOnce();
			expect(prisma.contentCheck.upsert).toHaveBeenCalledWith({
				where: { id: validId as string },
				create: {
					id: validId as string,
					userId: validUserId as string,
					source: 'web',
					originalText: 'テストコンテンツ',
					status: 'pending',
					slackChannelId: null,
					slackThreadTs: null,
					createdAt: now,
					updatedAt: now,
				},
				update: {
					status: 'pending',
					updatedAt: now,
				},
			});
		});

		it('should persist processing status correctly', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);
			const contentCheck = makeDomainContentCheck('processing');

			await repo.save(contentCheck);

			const call = (prisma.contentCheck.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.create.status).toBe('processing');
			expect(call.update.status).toBe('processing');
		});
	});

	describe('findById', () => {
		it('should return null when record not found', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);

			const result = await repo.findById(validId);

			expect(result).toBeNull();
			expect(prisma.contentCheck.findUnique).toHaveBeenCalledWith({
				where: { id: validId as string },
			});
		});

		it('should call reconstruct with mapped props when record found', async () => {
			const record = makePrismaRecord();
			const mockContentCheck = makeDomainContentCheck();
			vi.spyOn(ContentCheck, 'reconstruct').mockReturnValue(mockContentCheck);

			const prisma = createMockPrisma({
				findUnique: vi.fn().mockResolvedValue(record),
			});
			const repo = new PrismaContentCheckRepository(prisma);

			const result = await repo.findById(validId);

			expect(ContentCheck.reconstruct).toHaveBeenCalledWith({
				id: validId,
				userId: validUserId,
				content: 'テストコンテンツ',
				status: 'pending',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			});
			expect(result).toBe(mockContentCheck);
		});

		it('should throw when record has no userId', async () => {
			const record = makePrismaRecord({ userId: null });
			const prisma = createMockPrisma({
				findUnique: vi.fn().mockResolvedValue(record),
			});
			const repo = new PrismaContentCheckRepository(prisma);

			await expect(repo.findById(validId)).rejects.toThrow('has no userId');
		});
	});

	describe('findAll', () => {
		it('should return empty array when no records', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);

			const result = await repo.findAll();

			expect(result).toEqual([]);
			expect(prisma.contentCheck.findMany).toHaveBeenCalledWith({
				where: {},
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should apply userId filter', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);

			await repo.findAll({ userId: validUserId });

			expect(prisma.contentCheck.findMany).toHaveBeenCalledWith({
				where: { userId: validUserId as string },
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should apply status filter', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);

			await repo.findAll({ status: 'processing' });

			expect(prisma.contentCheck.findMany).toHaveBeenCalledWith({
				where: { status: 'processing' },
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should apply both userId and status filters', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaContentCheckRepository(prisma);

			await repo.findAll({ userId: validUserId, status: 'completed' });

			expect(prisma.contentCheck.findMany).toHaveBeenCalledWith({
				where: { userId: validUserId as string, status: 'completed' },
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should map records to domain models', async () => {
			const record = makePrismaRecord();
			const mockContentCheck = makeDomainContentCheck();
			vi.spyOn(ContentCheck, 'reconstruct').mockReturnValue(mockContentCheck);

			const prisma = createMockPrisma({
				findMany: vi.fn().mockResolvedValue([record]),
			});
			const repo = new PrismaContentCheckRepository(prisma);

			const result = await repo.findAll();

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(mockContentCheck);
		});
	});
});
