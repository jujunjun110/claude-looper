import { UpdateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/update-expression-rule.usecase';
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
		ngExpression: '旧NG表現',
		recommendedExpression: '旧推奨表現',
		description: '旧説明',
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

describe('UpdateExpressionRuleUseCase', () => {
	it('should find, update, save, and return the updated rule', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			id: validId,
			ngExpression: '新NG表現',
			recommendedExpression: '新推奨表現',
			description: '新説明',
		});

		expect(result).toBeInstanceOf(ExpressionRule);
		expect(result.id).toBe(validId);
		expect(result.ngExpression).toBe('新NG表現');
		expect(result.recommendedExpression).toBe('新推奨表現');
		expect(result.description).toBe('新説明');
		expect(repository.findById).toHaveBeenCalledWith(validId);
		expect(repository.save).toHaveBeenCalledOnce();
		expect(repository.save).toHaveBeenCalledWith(result);
	});

	it('should throw when rule is not found', async () => {
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: validId,
				ngExpression: '新NG表現',
				recommendedExpression: '新推奨表現',
			}),
		).rejects.toThrow(`ExpressionRule not found: ${validId}`);

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when ngExpression is empty', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: validId,
				ngExpression: '',
				recommendedExpression: '新推奨表現',
			}),
		).rejects.toThrow('NG expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when recommendedExpression is empty', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: validId,
				ngExpression: '新NG表現',
				recommendedExpression: '',
			}),
		).rejects.toThrow('Recommended expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should propagate errors from repository.save', async () => {
		const existing = makeRule();
		const repository = createMockRepository({
			findById: vi.fn().mockResolvedValue(existing),
			save: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new UpdateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				id: validId,
				ngExpression: '新NG表現',
				recommendedExpression: '新推奨表現',
			}),
		).rejects.toThrow('DB error');
	});
});
