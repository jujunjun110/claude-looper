declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ExpressionRuleId = string & { readonly [brand]: 'ExpressionRuleId' };

export function createExpressionRuleId(value: string): ExpressionRuleId {
	if (!value || value.trim().length === 0) {
		throw new Error('ExpressionRuleId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`ExpressionRuleId must be a valid UUID: ${value}`);
	}

	return value as ExpressionRuleId;
}
