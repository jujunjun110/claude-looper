import { PrismaExpressionRuleProvider } from '@/backend/contexts/content-check/infrastructure/prisma-expression-rule.provider';
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

function createMockPrisma(
	findManyResult: { ngExpression: string; recommendedExpression: string; isActive: boolean }[],
): PrismaClient {
	return {
		expressionRule: {
			findMany: vi.fn().mockResolvedValue(findManyResult),
		},
	} as unknown as PrismaClient;
}

describe('PrismaExpressionRuleProvider', () => {
	describe('findActiveRules', () => {
		it('should call prisma.expressionRule.findMany with isActive: true filter', async () => {
			const prisma = createMockPrisma([]);
			const provider = new PrismaExpressionRuleProvider(prisma);

			await provider.findActiveRules();

			expect(prisma.expressionRule.findMany).toHaveBeenCalledOnce();
			expect(prisma.expressionRule.findMany).toHaveBeenCalledWith({
				where: { isActive: true },
			});
		});

		it('should return empty array when no active rules', async () => {
			const prisma = createMockPrisma([]);
			const provider = new PrismaExpressionRuleProvider(prisma);

			const result = await provider.findActiveRules();

			expect(result).toEqual([]);
		});

		it('should map records to { ngExpression, recommendedExpression }', async () => {
			const prisma = createMockPrisma([
				{ ngExpression: 'NG1', recommendedExpression: '推奨1', isActive: true },
				{ ngExpression: 'NG2', recommendedExpression: '推奨2', isActive: true },
			]);
			const provider = new PrismaExpressionRuleProvider(prisma);

			const result = await provider.findActiveRules();

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({ ngExpression: 'NG1', recommendedExpression: '推奨1' });
			expect(result[1]).toEqual({ ngExpression: 'NG2', recommendedExpression: '推奨2' });
		});

		it('should not include fields other than ngExpression and recommendedExpression', async () => {
			const prisma = createMockPrisma([
				{ ngExpression: 'NG', recommendedExpression: '推奨', isActive: true },
			]);
			const provider = new PrismaExpressionRuleProvider(prisma);

			const result = await provider.findActiveRules();

			expect(result[0]).not.toHaveProperty('isActive');
		});
	});
});
