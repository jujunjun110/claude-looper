import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { PrismaClient, ExpressionRule as PrismaExpressionRule } from '@prisma/client';

export class PrismaExpressionRuleRepository implements ExpressionRuleRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(rule: ExpressionRule): Promise<void> {
		const data = this.toPrisma(rule);

		await this.prisma.expressionRule.upsert({
			where: { id: rule.id as string },
			create: data,
			update: {
				ngExpression: data.ngExpression,
				recommendedExpression: data.recommendedExpression,
				description: data.description,
				isActive: data.isActive,
			},
		});
	}

	async findById(id: ExpressionRuleId): Promise<ExpressionRule | null> {
		const record = await this.prisma.expressionRule.findUnique({
			where: { id: id as string },
		});

		if (!record) {
			return null;
		}

		return this.toDomain(record);
	}

	async findAll(): Promise<ExpressionRule[]> {
		const records = await this.prisma.expressionRule.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return records.map((record) => this.toDomain(record));
	}

	async findActive(): Promise<ExpressionRule[]> {
		const records = await this.prisma.expressionRule.findMany({
			where: { isActive: true },
			orderBy: { createdAt: 'desc' },
		});

		return records.map((record) => this.toDomain(record));
	}

	async delete(id: ExpressionRuleId): Promise<void> {
		await this.prisma.expressionRule.delete({
			where: { id: id as string },
		});
	}

	private toDomain(record: PrismaExpressionRule): ExpressionRule {
		return ExpressionRule.reconstruct({
			id: createExpressionRuleId(record.id),
			ngExpression: record.ngExpression,
			recommendedExpression: record.recommendedExpression,
			description: record.description,
			isActive: record.isActive,
			createdBy: createUserId(record.createdBy),
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});
	}

	private toPrisma(rule: ExpressionRule): {
		id: string;
		ngExpression: string;
		recommendedExpression: string;
		description: string | null;
		isActive: boolean;
		createdBy: string;
		createdAt: Date;
		updatedAt: Date;
	} {
		return {
			id: rule.id as string,
			ngExpression: rule.ngExpression,
			recommendedExpression: rule.recommendedExpression,
			description: rule.description,
			isActive: rule.isActive,
			createdBy: rule.createdBy as string,
			createdAt: rule.createdAt,
			updatedAt: rule.updatedAt,
		};
	}
}
