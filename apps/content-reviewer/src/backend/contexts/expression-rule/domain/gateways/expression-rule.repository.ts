import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';

export interface ExpressionRuleRepository {
	save(rule: ExpressionRule): Promise<void>;
	findById(id: ExpressionRuleId): Promise<ExpressionRule | null>;
	findAll(): Promise<ExpressionRule[]>;
	findActive(): Promise<ExpressionRule[]>;
	delete(id: ExpressionRuleId): Promise<void>;
}
