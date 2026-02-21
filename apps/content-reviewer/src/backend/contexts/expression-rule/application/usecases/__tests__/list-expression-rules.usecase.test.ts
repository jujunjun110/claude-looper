import { ListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/application/usecases/list-expression-rules.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildRule(idSuffix: string, isActive = true): ExpressionRule {
	const id = createExpressionRuleId(`00000000-0000-0000-0000-00000000000${idSuffix}`);
	const result = ExpressionRule.create({
		id,
		ngExpression: `NG表現${idSuffix}`,
		recommendedExpression: `推奨表現${idSuffix}`,
		createdBy: createUserId('user-123'),
	});

	if (!result.success) {
		throw new Error('Failed to build test fixture');
	}

	const rule = result.value;

	return isActive ? rule : rule.deactivate();
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
	describe('when activeOnly is not set (default: false)', () => {
		it('should return all expression rules', async () => {
			const rules = [buildRule('1'), buildRule('2', false), buildRule('3')];
			const repository = createMockRepository({
				findAll: vi.fn().mockResolvedValue(rules),
			});
			const useCase = new ListExpressionRulesUseCase(repository);

			const result = await useCase.execute();

			expect(result).toEqual(rules);
			expect(repository.findAll).toHaveBeenCalledOnce();
			expect(repository.findActive).not.toHaveBeenCalled();
		});

		it('should return empty array when no rules exist', async () => {
			const repository = createMockRepository({
				findAll: vi.fn().mockResolvedValue([]),
			});
			const useCase = new ListExpressionRulesUseCase(repository);

			const result = await useCase.execute();

			expect(result).toEqual([]);
		});
	});

	describe('when activeOnly is true', () => {
		it('should return only active expression rules', async () => {
			const activeRules = [buildRule('1'), buildRule('3')];
			const repository = createMockRepository({
				findActive: vi.fn().mockResolvedValue(activeRules),
			});
			const useCase = new ListExpressionRulesUseCase(repository);

			const result = await useCase.execute({ activeOnly: true });

			expect(result).toEqual(activeRules);
			expect(repository.findActive).toHaveBeenCalledOnce();
			expect(repository.findAll).not.toHaveBeenCalled();
		});

		it('should return empty array when no active rules exist', async () => {
			const repository = createMockRepository({
				findActive: vi.fn().mockResolvedValue([]),
			});
			const useCase = new ListExpressionRulesUseCase(repository);

			const result = await useCase.execute({ activeOnly: true });

			expect(result).toEqual([]);
		});
	});

	describe('when activeOnly is false', () => {
		it('should return all expression rules', async () => {
			const rules = [buildRule('1'), buildRule('2', false)];
			const repository = createMockRepository({
				findAll: vi.fn().mockResolvedValue(rules),
			});
			const useCase = new ListExpressionRulesUseCase(repository);

			const result = await useCase.execute({ activeOnly: false });

			expect(result).toEqual(rules);
			expect(repository.findAll).toHaveBeenCalledOnce();
			expect(repository.findActive).not.toHaveBeenCalled();
		});
	});

	it('should propagate repository errors', async () => {
		const repository = createMockRepository({
			findAll: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new ListExpressionRulesUseCase(repository);

		await expect(useCase.execute()).rejects.toThrow('DB error');
	});

	it('should propagate repository errors for active query', async () => {
		const repository = createMockRepository({
			findActive: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new ListExpressionRulesUseCase(repository);

		await expect(useCase.execute({ activeOnly: true })).rejects.toThrow('DB error');
	});
});
