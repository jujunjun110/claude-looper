'use server';

import { loadCurrentUser } from '@/backend/contexts/auth/presentation/loaders/current-user.loader';
import {
	createCreateExpressionRuleUseCase,
	createDeleteExpressionRuleUseCase,
	createUpdateExpressionRuleUseCase,
} from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';
import { createExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { revalidatePath } from 'next/cache';

export interface CreateExpressionRuleActionInput {
	ngExpression: string;
	recommendedExpression: string;
	description?: string | null;
}

export interface UpdateExpressionRuleActionInput {
	id: string;
	ngExpression: string;
	recommendedExpression: string;
	description?: string | null;
}

export async function createExpressionRuleAction(
	input: CreateExpressionRuleActionInput,
): Promise<void> {
	const currentUser = await loadCurrentUser();
	const userId = createUserId(currentUser?.id ?? '00000000-0000-0000-0000-000000000000');

	const useCase = createCreateExpressionRuleUseCase();
	await useCase.execute({
		ngExpression: input.ngExpression,
		recommendedExpression: input.recommendedExpression,
		description: input.description,
		createdBy: userId,
	});

	revalidatePath('/rules');
}

export async function updateExpressionRuleAction(
	input: UpdateExpressionRuleActionInput,
): Promise<void> {
	const useCase = createUpdateExpressionRuleUseCase();
	await useCase.execute({
		id: createExpressionRuleId(input.id),
		ngExpression: input.ngExpression,
		recommendedExpression: input.recommendedExpression,
		description: input.description,
	});

	revalidatePath('/rules');
}

export async function deleteExpressionRuleAction(id: string): Promise<void> {
	const useCase = createDeleteExpressionRuleUseCase();
	await useCase.execute(createExpressionRuleId(id));

	revalidatePath('/rules');
}
