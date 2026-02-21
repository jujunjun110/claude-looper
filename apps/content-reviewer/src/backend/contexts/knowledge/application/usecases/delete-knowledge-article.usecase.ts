import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';

export class DeleteKnowledgeArticleUseCase {
	constructor(
		private readonly articleRepository: KnowledgeArticleRepository,
		private readonly embeddingRepository: KnowledgeEmbeddingRepository,
	) {}

	async execute(id: KnowledgeArticleId): Promise<void> {
		const existing = await this.articleRepository.findById(id);

		if (!existing) {
			throw new Error(`KnowledgeArticle not found: ${id}`);
		}

		await this.embeddingRepository.deleteByArticleId(id);
		await this.articleRepository.delete(id);
	}
}
