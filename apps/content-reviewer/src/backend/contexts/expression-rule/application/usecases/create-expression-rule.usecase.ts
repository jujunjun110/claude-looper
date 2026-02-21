import { randomUUID } from 'node:crypto';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export interface CreateExpressionRuleInput {
	id?: ExpressionRuleId;
	ngExpression: string;
	recommendedExpression: string;
	description?: string | null;
	createdBy: UserId;
}

export class CreateExpressionRuleUseCase {
	constructor(private readonly repository: ExpressionRuleRepository) {}

	async execute(input: CreateExpressionRuleInput): Promise<ExpressionRule> {
		const id = input.id ?? createExpressionRuleId(randomUUID());

		const result = ExpressionRule.create({
			id,
			ngExpression: input.ngExpression,
			recommendedExpression: input.recommendedExpression,
			description: input.description,
			createdBy: input.createdBy,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		await this.repository.save(result.value);

		return result.value;
	}
}
