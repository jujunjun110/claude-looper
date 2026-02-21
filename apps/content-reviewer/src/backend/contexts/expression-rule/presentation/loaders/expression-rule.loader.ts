import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';

export async function loadExpressionRules(): Promise<ExpressionRule[]> {
	const useCase = createListExpressionRulesUseCase();
	return useCase.execute({});
}
