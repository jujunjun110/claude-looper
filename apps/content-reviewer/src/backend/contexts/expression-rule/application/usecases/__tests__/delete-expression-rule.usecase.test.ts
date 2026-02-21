import { DeleteExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/delete-expression-rule.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildExistingRule(): ExpressionRule {
	const result = ExpressionRule.create({
		id: createExpressionRuleId('00000000-0000-0000-0000-000000000001'),
		ngExpression: 'NG表現',
		recommendedExpression: '推奨表現',
		createdBy: createUserId('user-123'),
	});

	if (!result.success) {
		throw new Error('Failed to build test fixture');
	}

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
	const ruleId = createExpressionRuleId('00000000-0000-0000-0000-000000000001');

	it('should delete an existing expression rule', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await useCase.execute(ruleId);

		expect(repository.findById).toHaveBeenCalledWith(ruleId);
		expect(repository.delete).toHaveBeenCalledWith(ruleId);
	});

	it('should throw when rule does not exist', async () => {
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await expect(useCase.execute(ruleId)).rejects.toThrow(`ExpressionRule not found: ${ruleId}`);

		expect(repository.delete).not.toHaveBeenCalled();
	});

	it('should propagate repository errors on delete', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
			delete: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await expect(useCase.execute(ruleId)).rejects.toThrow('DB error');
	});

	it('should propagate repository errors on findById', async () => {
		const repository = createMockRepository({
			findById: vi.fn().mockRejectedValue(new Error('DB connection error')),
		});
		const useCase = new DeleteExpressionRuleUseCase(repository);

		await expect(useCase.execute(ruleId)).rejects.toThrow('DB connection error');

		expect(repository.delete).not.toHaveBeenCalled();
	});
});
