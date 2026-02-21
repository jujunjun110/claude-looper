import type { ExpressionRuleProvider } from '@/backend/contexts/content-check/domain/gateways/expression-rule.provider';
import type { PrismaClient } from '@prisma/client';

export class PrismaExpressionRuleProvider implements ExpressionRuleProvider {
	constructor(private readonly prisma: PrismaClient) {}

	async findActiveRules(): Promise<{ ngExpression: string; recommendedExpression: string }[]> {
		const records = await this.prisma.expressionRule.findMany({
			where: { isActive: true },
		});

		return records.map((record) => ({
			ngExpression: record.ngExpression,
			recommendedExpression: record.recommendedExpression,
		}));
	}
}
