'use server';

import { createUpdateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { revalidatePath } from 'next/cache';

export async function updateKnowledgeArticleAction(formData: FormData): Promise<void> {
	const id = formData.get('id');
	const title = formData.get('title');
	const content = formData.get('content');

	if (typeof id !== 'string' || typeof title !== 'string' || typeof content !== 'string') {
		throw new Error('id, title and content are required');
	}

	const useCase = createUpdateKnowledgeArticleUseCase();
	await useCase.execute({
		id: createKnowledgeArticleId(id),
		title,
		content,
	});

	revalidatePath('/knowledge');
}
