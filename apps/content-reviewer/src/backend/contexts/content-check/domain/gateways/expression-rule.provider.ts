export interface ExpressionRuleProvider {
	findActiveRules(): Promise<{ ngExpression: string; recommendedExpression: string }[]>;
}
