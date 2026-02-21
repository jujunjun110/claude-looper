import { ListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/application/usecases/list-expression-rules.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');

function makeRule(idStr: string): ExpressionRule {
	const result = ExpressionRule.create({
		id: createExpressionRuleId(idStr),
		ngExpression: 'NG表現',
		recommendedExpression: '推奨表現',
		createdBy: validUserId,
	});
	if (!result.success) throw new Error('setup failed');
	return result.value;
}

function createMockRepository(
	overrides: Partial<ExpressionRuleRepository> = {},
): ExpressionRuleRepository {
	return {
		save: vi.fn().mockResolvedValue(undefined),
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		findActive: vi.fn().mockResolvedValue([]),
		delete: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe('ListExpressionRulesUseCase', () => {
	it('should return all rules from repository', async () => {
		const rules = [
			makeRule('550e8400-e29b-41d4-a716-446655440000'),
			makeRule('550e8400-e29b-41d4-a716-446655440001'),
		];
		const repository = createMockRepository({
			findAll: vi.fn().mockResolvedValue(rules),
		});
		const useCase = new ListExpressionRulesUseCase(repository);

		const result = await useCase.execute();

		expect(result).toBe(rules);
		expect(result).toHaveLength(2);
		expect(repository.findAll).toHaveBeenCalledOnce();
	});

	it('should return empty array when no rules exist', async () => {
		const repository = createMockRepository({
			findAll: vi.fn().mockResolvedValue([]),
		});
		const useCase = new ListExpressionRulesUseCase(repository);

		const result = await useCase.execute();

		expect(result).toEqual([]);
		expect(repository.findAll).toHaveBeenCalledOnce();
	});

	it('should propagate errors from repository.findAll', async () => {
		const repository = createMockRepository({
			findAll: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new ListExpressionRulesUseCase(repository);

		await expect(useCase.execute()).rejects.toThrow('DB error');
	});
});
