import { CreateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');

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

describe('CreateExpressionRuleUseCase', () => {
	it('should create and save an ExpressionRule', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			ngExpression: '善処します',
			recommendedExpression: '具体的に対応します',
			description: '曖昧な表現を避ける',
			createdBy: validUserId,
		});

		expect(result).toBeInstanceOf(ExpressionRule);
		expect(result.ngExpression).toBe('善処します');
		expect(result.recommendedExpression).toBe('具体的に対応します');
		expect(result.description).toBe('曖昧な表現を避ける');
		expect(result.isActive).toBe(true);
		expect(repository.save).toHaveBeenCalledOnce();
		expect(repository.save).toHaveBeenCalledWith(result);
	});

	it('should create without description', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			ngExpression: 'NG表現',
			recommendedExpression: '推奨表現',
			createdBy: validUserId,
		});

		expect(result.description).toBeNull();
		expect(repository.save).toHaveBeenCalledOnce();
	});

	it('should throw when ngExpression is empty', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: '',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			}),
		).rejects.toThrow('NG expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when recommendedExpression is empty', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: 'NG表現',
				recommendedExpression: '',
				createdBy: validUserId,
			}),
		).rejects.toThrow('Recommended expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should propagate errors from repository.save', async () => {
		const repository = createMockRepository({
			save: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			}),
		).rejects.toThrow('DB error');
	});
});
