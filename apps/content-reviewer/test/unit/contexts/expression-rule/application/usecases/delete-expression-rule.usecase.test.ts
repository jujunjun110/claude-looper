import { DeleteExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/delete-expression-rule.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const validId = createExpressionRuleId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');

function makeRule(): ExpressionRule {
	const result = ExpressionRule.create({
		id: validId,
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

describe('DeleteExpressionRuleUseCase', () => {
	it('should find and delete the rule', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await useCase.execute(validId);

		expect(repository.findById).toHaveBeenCalledWith(validId);
		expect(repository.delete).toHaveBeenCalledWith(validId);
	});

	it('should throw when rule is not found', async () => {
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await expect(useCase.execute(validId)).rejects.toThrow(`ExpressionRule not found: ${validId}`);

		expect(repository.delete).not.toHaveBeenCalled();
	});

	it('should propagate errors from repository.delete', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
			delete: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await expect(useCase.execute(validId)).rejects.toThrow('DB error');
	});
});
