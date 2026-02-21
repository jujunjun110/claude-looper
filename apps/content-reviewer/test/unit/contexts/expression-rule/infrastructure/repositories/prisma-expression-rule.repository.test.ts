import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { PrismaExpressionRuleRepository } from '@/backend/contexts/expression-rule/infrastructure/repositories/prisma-expression-rule.repository';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { PrismaClient, ExpressionRule as PrismaExpressionRule } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const validId = createExpressionRuleId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');
const now = new Date('2024-01-01T00:00:00.000Z');

function makePrismaRecord(overrides: Partial<PrismaExpressionRule> = {}): PrismaExpressionRule {
	return {
		id: validId as string,
		ngExpression: 'NG表現',
		recommendedExpression: '推奨表現',
		description: '説明',
		isActive: true,
		createdBy: validUserId as string,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function createMockPrisma(
	overrides: Partial<{
		expressionRule: {
			upsert: ReturnType<typeof vi.fn>;
			findUnique: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
			delete: ReturnType<typeof vi.fn>;
		};
	}> = {},
): PrismaClient {
	return {
		expressionRule: {
			upsert: vi.fn().mockResolvedValue(undefined),
			findUnique: vi.fn().mockResolvedValue(null),
			findMany: vi.fn().mockResolvedValue([]),
			delete: vi.fn().mockResolvedValue(undefined),
			...overrides.expressionRule,
		},
	} as unknown as PrismaClient;
}

describe('PrismaExpressionRuleRepository', () => {
	describe('save', () => {
		it('should call prisma.expressionRule.upsert with correct data', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				description: '説明',
				createdBy: validUserId,
				createdAt: now,
				updatedAt: now,
			});
			if (!createResult.success) throw new Error('setup failed');

			await repo.save(createResult.value);

			expect(prisma.expressionRule.upsert).toHaveBeenCalledOnce();
			expect(prisma.expressionRule.upsert).toHaveBeenCalledWith({
				where: { id: validId as string },
				create: {
					id: validId as string,
					ngExpression: 'NG表現',
					recommendedExpression: '推奨表現',
					description: '説明',
					isActive: true,
					createdBy: validUserId as string,
					createdAt: now,
					updatedAt: now,
				},
				update: {
					ngExpression: 'NG表現',
					recommendedExpression: '推奨表現',
					description: '説明',
					isActive: true,
				},
			});
		});

		it('should handle null description on save', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
				createdAt: now,
				updatedAt: now,
			});
			if (!createResult.success) throw new Error('setup failed');

			await repo.save(createResult.value);

			const call = (prisma.expressionRule.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.create.description).toBeNull();
			expect(call.update.description).toBeNull();
		});
	});

	describe('findById', () => {
		it('should return null when record not found', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findById(validId);

			expect(result).toBeNull();
			expect(prisma.expressionRule.findUnique).toHaveBeenCalledWith({
				where: { id: validId as string },
			});
		});

		it('should return an ExpressionRule when record found', async () => {
			const record = makePrismaRecord();
			const prisma = createMockPrisma({
				expressionRule: {
					upsert: vi.fn(),
					findUnique: vi.fn().mockResolvedValue(record),
					findMany: vi.fn(),
					delete: vi.fn(),
				},
			});
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findById(validId);

			expect(result).not.toBeNull();
			expect(result?.id).toBe(validId);
			expect(result?.ngExpression).toBe('NG表現');
			expect(result?.recommendedExpression).toBe('推奨表現');
			expect(result?.description).toBe('説明');
			expect(result?.isActive).toBe(true);
			expect(result?.createdBy).toBe(validUserId);
		});

		it('should reconstruct rule with null description', async () => {
			const record = makePrismaRecord({ description: null });
			const prisma = createMockPrisma({
				expressionRule: {
					upsert: vi.fn(),
					findUnique: vi.fn().mockResolvedValue(record),
					findMany: vi.fn(),
					delete: vi.fn(),
				},
			});
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findById(validId);

			expect(result?.description).toBeNull();
		});

		it('should reconstruct inactive rule', async () => {
			const record = makePrismaRecord({ isActive: false });
			const prisma = createMockPrisma({
				expressionRule: {
					upsert: vi.fn(),
					findUnique: vi.fn().mockResolvedValue(record),
					findMany: vi.fn(),
					delete: vi.fn(),
				},
			});
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findById(validId);

			expect(result?.isActive).toBe(false);
		});
	});

	describe('findAll', () => {
		it('should return empty array when no records', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findAll();

			expect(result).toEqual([]);
			expect(prisma.expressionRule.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should return all rules ordered by createdAt desc', async () => {
			const record1 = makePrismaRecord({ id: '550e8400-e29b-41d4-a716-446655440000' });
			const record2 = makePrismaRecord({
				id: '660e8400-e29b-41d4-a716-446655440000',
				ngExpression: '別のNG表現',
				recommendedExpression: '別の推奨表現',
			});
			const prisma = createMockPrisma({
				expressionRule: {
					upsert: vi.fn(),
					findUnique: vi.fn(),
					findMany: vi.fn().mockResolvedValue([record1, record2]),
					delete: vi.fn(),
				},
			});
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findAll();

			expect(result).toHaveLength(2);
			expect(result[0].ngExpression).toBe('NG表現');
			expect(result[1].ngExpression).toBe('別のNG表現');
		});
	});

	describe('findActive', () => {
		it('should query with isActive: true filter', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);

			await repo.findActive();

			expect(prisma.expressionRule.findMany).toHaveBeenCalledWith({
				where: { isActive: true },
				orderBy: { createdAt: 'desc' },
			});
		});

		it('should return only active rules', async () => {
			const activeRecord = makePrismaRecord({ isActive: true });
			const prisma = createMockPrisma({
				expressionRule: {
					upsert: vi.fn(),
					findUnique: vi.fn(),
					findMany: vi.fn().mockResolvedValue([activeRecord]),
					delete: vi.fn(),
				},
			});
			const repo = new PrismaExpressionRuleRepository(prisma);

			const result = await repo.findActive();

			expect(result).toHaveLength(1);
			expect(result[0].isActive).toBe(true);
		});
	});

	describe('delete', () => {
		it('should call prisma.expressionRule.delete with correct id', async () => {
			const prisma = createMockPrisma();
			const repo = new PrismaExpressionRuleRepository(prisma);

			await repo.delete(validId);

			expect(prisma.expressionRule.delete).toHaveBeenCalledOnce();
			expect(prisma.expressionRule.delete).toHaveBeenCalledWith({
				where: { id: validId as string },
			});
		});
	});
});
