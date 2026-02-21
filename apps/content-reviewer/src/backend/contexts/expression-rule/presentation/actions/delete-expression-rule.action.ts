'use server';

import { createDeleteExpressionRuleUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { revalidatePath } from 'next/cache';

export async function deleteExpressionRuleAction(formData: FormData): Promise<void> {
	const id = formData.get('id');

	if (typeof id !== 'string') {
		throw new Error('id is required');
	}

	const useCase = createDeleteExpressionRuleUseCase();
	await useCase.execute(createExpressionRuleId(id));

	revalidatePath('/rules');
}
