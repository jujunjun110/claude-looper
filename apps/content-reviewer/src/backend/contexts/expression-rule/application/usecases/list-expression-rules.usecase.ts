import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';

export class ListExpressionRulesUseCase {
	constructor(private readonly repository: ExpressionRuleRepository) {}

	async execute(): Promise<ExpressionRule[]> {
		return this.repository.findAll();
	}
}
