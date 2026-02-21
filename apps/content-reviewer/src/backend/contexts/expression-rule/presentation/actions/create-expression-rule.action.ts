'use server';

import { createCreateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function createExpressionRuleAction(formData: FormData): Promise<void> {
	const ngExpression = formData.get('ngExpression');
	const recommendedExpression = formData.get('recommendedExpression');
	const description = formData.get('description');

	if (typeof ngExpression !== 'string' || typeof recommendedExpression !== 'string') {
		throw new Error('ngExpression and recommendedExpression are required');
	}

	const createdBy = createUserId(
		process.env.NODE_ENV === 'development'
			? DUMMY_USER_ID
			: (process.env.SYSTEM_USER_ID ?? DUMMY_USER_ID),
	);

	const useCase = createCreateExpressionRuleUseCase();
	await useCase.execute({
		ngExpression,
		recommendedExpression,
		description: typeof description === 'string' && description.length > 0 ? description : null,
		createdBy,
	});

	revalidatePath('/rules');
}
