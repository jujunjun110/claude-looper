import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';

export interface UpdateExpressionRuleInput {
	id: ExpressionRuleId;
	ngExpression: string;
	recommendedExpression: string;
	description?: string | null;
}

export class UpdateExpressionRuleUseCase {
	constructor(private readonly repository: ExpressionRuleRepository) {}

	async execute(input: UpdateExpressionRuleInput): Promise<ExpressionRule> {
		const existing = await this.repository.findById(input.id);

		if (!existing) {
			throw new Error(`ExpressionRule not found: ${input.id}`);
		}

		const result = existing.update({
			ngExpression: input.ngExpression,
			recommendedExpression: input.recommendedExpression,
			description: input.description,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		await this.repository.save(result.value);

		return result.value;
	}
}
