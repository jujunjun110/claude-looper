import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';

export class DeleteExpressionRuleUseCase {
	constructor(private readonly repository: ExpressionRuleRepository) {}

	async execute(id: ExpressionRuleId): Promise<void> {
		const existing = await this.repository.findById(id);
		if (!existing) {
			throw new Error(`ExpressionRule not found: ${id}`);
		}

		await this.repository.delete(id);
	}
}
