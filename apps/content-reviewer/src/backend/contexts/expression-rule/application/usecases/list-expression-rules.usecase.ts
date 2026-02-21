import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';

export interface ListExpressionRulesInput {
	activeOnly?: boolean;
}

export class ListExpressionRulesUseCase {
	constructor(private readonly repository: ExpressionRuleRepository) {}

	async execute(input: ListExpressionRulesInput = {}): Promise<ExpressionRule[]> {
		if (input.activeOnly) {
			return this.repository.findActive();
		}

		return this.repository.findAll();
	}
}
