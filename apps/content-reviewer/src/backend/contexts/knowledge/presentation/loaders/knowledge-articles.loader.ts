import { createListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';

export interface KnowledgeArticleDTO {
	id: string;
	title: string;
	content: string;
	sourceType: 'manual' | 'note';
	sourceUrl: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export async function loadKnowledgeArticles(): Promise<KnowledgeArticleDTO[]> {
	const useCase = createListKnowledgeArticlesUseCase();
	const articles = await useCase.execute();
	return articles.map((article) => ({
		id: article.id as string,
		title: article.title,
		content: article.content,
		sourceType: article.sourceType,
		sourceUrl: article.sourceUrl,
		createdBy: article.createdBy as string,
		createdAt: article.createdAt.toISOString(),
		updatedAt: article.updatedAt.toISOString(),
	}));
}
