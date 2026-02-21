import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { describe, expect, it } from 'vitest';

describe('ExpressionRuleId', () => {
	it('should create an ExpressionRuleId from a valid UUID', () => {
		const id = createExpressionRuleId('550e8400-e29b-41d4-a716-446655440000');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('should accept uppercase UUID', () => {
		const id = createExpressionRuleId('550E8400-E29B-41D4-A716-446655440000');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440000');
	});

	it('should throw on empty string', () => {
		expect(() => createExpressionRuleId('')).toThrow('ExpressionRuleId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createExpressionRuleId('   ')).toThrow('ExpressionRuleId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createExpressionRuleId('not-a-uuid')).toThrow(
			'ExpressionRuleId must be a valid UUID',
		);
	});

	it('should throw on UUID without hyphens', () => {
		expect(() => createExpressionRuleId('550e8400e29b41d4a716446655440000')).toThrow(
			'ExpressionRuleId must be a valid UUID',
		);
	});
});
