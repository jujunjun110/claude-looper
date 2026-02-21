import { UpdateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/update-expression-rule.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildExistingRule(): ExpressionRule {
	const result = ExpressionRule.create({
		id: createExpressionRuleId('00000000-0000-0000-0000-000000000001'),
		ngExpression: '元のNG表現',
		recommendedExpression: '元の推奨表現',
		description: '元の説明',
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

describe('UpdateExpressionRuleUseCase', () => {
	const ruleId = createExpressionRuleId('00000000-0000-0000-0000-000000000001');

	it('should update and save an existing expression rule', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			id: ruleId,
			ngExpression: '新しいNG表現',
			recommendedExpression: '新しい推奨表現',
		});

		expect(result.id).toBe(ruleId);
		expect(result.ngExpression).toBe('新しいNG表現');
		expect(result.recommendedExpression).toBe('新しい推奨表現');
		expect(result.description).toBeNull();
		expect(repository.findById).toHaveBeenCalledWith(ruleId);
		expect(repository.save).toHaveBeenCalledWith(result);
	});

	it('should update description', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			id: ruleId,
			ngExpression: '新しいNG表現',
			recommendedExpression: '新しい推奨表現',
			description: '新しい説明',
		});

		expect(result.description).toBe('新しい説明');
	});

	it('should preserve createdBy from existing rule', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			id: ruleId,
			ngExpression: '新しいNG表現',
			recommendedExpression: '新しい推奨表現',
		});

		expect(result.createdBy).toBe(existing.createdBy);
	});

	it('should throw when rule does not exist', async () => {
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: ruleId,
				ngExpression: '新しいNG表現',
				recommendedExpression: '新しい推奨表現',
			}),
		).rejects.toThrow(`ExpressionRule not found: ${ruleId}`);

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when ngExpression is empty', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: ruleId,
				ngExpression: '',
				recommendedExpression: '新しい推奨表現',
			}),
		).rejects.toThrow('NG expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when recommendedExpression is empty', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: ruleId,
				ngExpression: '新しいNG表現',
				recommendedExpression: '',
			}),
		).rejects.toThrow('Recommended expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should propagate repository errors on save', async () => {
		const existing = buildExistingRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
			save: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: ruleId,
				ngExpression: '新しいNG表現',
				recommendedExpression: '新しい推奨表現',
			}),
		).rejects.toThrow('DB error');
	});
});
