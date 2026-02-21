import { CreateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase';
import type { ExpressionRuleRepository } from '@/backend/contexts/expression-rule/domain/gateways/expression-rule.repository';
import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

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
	const createdBy = createUserId('user-123');

	it('should create and save an expression rule', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			ngExpression: 'NG表現',
			recommendedExpression: '推奨表現',
			createdBy,
		});

		expect(result.ngExpression).toBe('NG表現');
		expect(result.recommendedExpression).toBe('推奨表現');
		expect(result.description).toBeNull();
		expect(result.isActive).toBe(true);
		expect(result.createdBy).toBe(createdBy);
		expect(repository.save).toHaveBeenCalledOnce();
		expect(repository.save).toHaveBeenCalledWith(result);
	});

	it('should create with description', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			ngExpression: 'NG表現',
			recommendedExpression: '推奨表現',
			description: '説明文',
			createdBy,
		});

		expect(result.description).toBe('説明文');
	});

	it('should trim whitespace from expressions', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result = await useCase.execute({
			ngExpression: '  NG表現  ',
			recommendedExpression: '  推奨表現  ',
			createdBy,
		});

		expect(result.ngExpression).toBe('NG表現');
		expect(result.recommendedExpression).toBe('推奨表現');
	});

	it('should throw when ngExpression is empty', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: '',
				recommendedExpression: '推奨表現',
				createdBy,
			}),
		).rejects.toThrow('NG expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should throw when ngExpression is whitespace only', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: '   ',
				recommendedExpression: '推奨表現',
				createdBy,
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
				createdBy,
			}),
		).rejects.toThrow('Recommended expression cannot be empty');

		expect(repository.save).not.toHaveBeenCalled();
	});

	it('should propagate repository errors', async () => {
		const repository = createMockRepository({
			save: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new CreateExpressionRuleUseCase(repository);

		await expect(
			useCase.execute({
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy,
			}),
		).rejects.toThrow('DB error');
	});

	it('should assign a unique id to each created rule', async () => {
		const repository = createMockRepository();
		const useCase = new CreateExpressionRuleUseCase(repository);

		const result1 = await useCase.execute({
			ngExpression: 'NG表現1',
			recommendedExpression: '推奨表現1',
			createdBy,
		});

		const result2 = await useCase.execute({
			ngExpression: 'NG表現2',
			recommendedExpression: '推奨表現2',
			createdBy,
		});

		expect(result1.id).not.toBe(result2.id);
	});
});
