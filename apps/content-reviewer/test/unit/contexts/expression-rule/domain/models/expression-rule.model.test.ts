import { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

const validId = createExpressionRuleId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('660e8400-e29b-41d4-a716-446655440000');

describe('ExpressionRule', () => {
	describe('create', () => {
		it('should create an ExpressionRule with valid props', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: '善処します',
				recommendedExpression: '具体的に対応します',
				description: '曖昧な表現を避ける',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (!result.success) return;

			expect(result.value.id).toBe(validId);
			expect(result.value.ngExpression).toBe('善処します');
			expect(result.value.recommendedExpression).toBe('具体的に対応します');
			expect(result.value.description).toBe('曖昧な表現を避ける');
			expect(result.value.isActive).toBe(true);
			expect(result.value.createdBy).toBe(validUserId);
			expect(result.value.createdAt).toBeInstanceOf(Date);
			expect(result.value.updatedAt).toBeInstanceOf(Date);
		});

		it('should create with null description when omitted', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (!result.success) return;

			expect(result.value.description).toBeNull();
		});

		it('should trim whitespace from expressions', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: '  NG表現  ',
				recommendedExpression: '  推奨表現  ',
				description: '  説明  ',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (!result.success) return;

			expect(result.value.ngExpression).toBe('NG表現');
			expect(result.value.recommendedExpression).toBe('推奨表現');
			expect(result.value.description).toBe('説明');
		});

		it('should fail when ngExpression is empty', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: '',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (result.success) return;

			expect(result.error).toBe('NG expression cannot be empty');
		});

		it('should fail when ngExpression is whitespace only', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: '   ',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (result.success) return;

			expect(result.error).toBe('NG expression cannot be empty');
		});

		it('should fail when recommendedExpression is empty', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (result.success) return;

			expect(result.error).toBe('Recommended expression cannot be empty');
		});

		it('should fail when recommendedExpression is whitespace only', () => {
			const result = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '   ',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (result.success) return;

			expect(result.error).toBe('Recommended expression cannot be empty');
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct an ExpressionRule from props', () => {
			const now = new Date();
			const rule = ExpressionRule.reconstruct({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				description: '説明',
				isActive: false,
				createdBy: validUserId,
				createdAt: now,
				updatedAt: now,
			});

			expect(rule.id).toBe(validId);
			expect(rule.isActive).toBe(false);
		});
	});

	describe('update', () => {
		it('should update expressions and description', () => {
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: '旧NG表現',
				recommendedExpression: '旧推奨表現',
				description: '旧説明',
				createdBy: validUserId,
			});
			if (!createResult.success) throw new Error('setup failed');

			const updateResult = createResult.value.update({
				ngExpression: '新NG表現',
				recommendedExpression: '新推奨表現',
				description: '新説明',
			});

			expect(updateResult.success).toBe(true);
			if (!updateResult.success) return;

			expect(updateResult.value.ngExpression).toBe('新NG表現');
			expect(updateResult.value.recommendedExpression).toBe('新推奨表現');
			expect(updateResult.value.description).toBe('新説明');
			expect(updateResult.value.id).toBe(validId);
			expect(updateResult.value.createdBy).toBe(validUserId);
			expect(updateResult.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
				createResult.value.updatedAt.getTime(),
			);
		});

		it('should fail update when ngExpression is empty', () => {
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});
			if (!createResult.success) throw new Error('setup failed');

			const updateResult = createResult.value.update({
				ngExpression: '',
				recommendedExpression: '新推奨表現',
			});

			expect(updateResult.success).toBe(false);
			if (updateResult.success) return;

			expect(updateResult.error).toBe('NG expression cannot be empty');
		});

		it('should fail update when recommendedExpression is empty', () => {
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});
			if (!createResult.success) throw new Error('setup failed');

			const updateResult = createResult.value.update({
				ngExpression: '新NG表現',
				recommendedExpression: '',
			});

			expect(updateResult.success).toBe(false);
			if (updateResult.success) return;

			expect(updateResult.error).toBe('Recommended expression cannot be empty');
		});
	});

	describe('deactivate / activate', () => {
		it('should deactivate an active rule', () => {
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});
			if (!createResult.success) throw new Error('setup failed');

			const deactivated = createResult.value.deactivate();

			expect(deactivated.isActive).toBe(false);
			expect(deactivated.id).toBe(validId);
			expect(deactivated.ngExpression).toBe('NG表現');
		});

		it('should activate an inactive rule', () => {
			const createResult = ExpressionRule.create({
				id: validId,
				ngExpression: 'NG表現',
				recommendedExpression: '推奨表現',
				createdBy: validUserId,
			});
			if (!createResult.success) throw new Error('setup failed');

			const deactivated = createResult.value.deactivate();
			const activated = deactivated.activate();

			expect(activated.isActive).toBe(true);
		});
	});
});
