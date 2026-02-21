import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';

export class ListKnowledgeArticlesUseCase {
	constructor(private readonly articleRepository: KnowledgeArticleRepository) {}

	async execute(): Promise<KnowledgeArticle[]> {
		return this.articleRepository.findAll();
	}
}
