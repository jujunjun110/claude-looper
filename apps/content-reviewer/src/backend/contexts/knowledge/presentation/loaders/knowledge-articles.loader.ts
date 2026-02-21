import type { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';

export async function loadKnowledgeArticles(): Promise<KnowledgeArticle[]> {
	const useCase = createListKnowledgeArticlesUseCase();
	return useCase.execute();
}
