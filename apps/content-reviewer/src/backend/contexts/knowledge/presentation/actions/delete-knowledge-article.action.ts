'use server';

import { createDeleteKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { revalidatePath } from 'next/cache';

export async function deleteKnowledgeArticleAction(formData: FormData): Promise<void> {
	const id = formData.get('id');

	if (typeof id !== 'string') {
		throw new Error('id is required');
	}

	const useCase = createDeleteKnowledgeArticleUseCase();
	await useCase.execute(createKnowledgeArticleId(id));

	revalidatePath('/knowledge');
}
