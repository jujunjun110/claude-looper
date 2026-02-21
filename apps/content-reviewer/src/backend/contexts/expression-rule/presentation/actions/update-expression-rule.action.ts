'use server';

import { createUpdateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { revalidatePath } from 'next/cache';

export async function updateExpressionRuleAction(formData: FormData): Promise<void> {
	const id = formData.get('id');
	const ngExpression = formData.get('ngExpression');
	const recommendedExpression = formData.get('recommendedExpression');
	const description = formData.get('description');

	if (
		typeof id !== 'string' ||
		typeof ngExpression !== 'string' ||
		typeof recommendedExpression !== 'string'
	) {
		throw new Error('id, ngExpression and recommendedExpression are required');
	}

	const useCase = createUpdateExpressionRuleUseCase();
	await useCase.execute({
		id: createExpressionRuleId(id),
		ngExpression,
		recommendedExpression,
		description: typeof description === 'string' && description.length > 0 ? description : null,
	});

	revalidatePath('/rules');
}
