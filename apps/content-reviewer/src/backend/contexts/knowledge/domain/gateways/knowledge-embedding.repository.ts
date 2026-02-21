import type { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';

export interface KnowledgeEmbeddingRepository {
	saveMany(embeddings: KnowledgeEmbedding[]): Promise<void>;
	deleteByArticleId(articleId: KnowledgeArticleId): Promise<void>;
	searchSimilar(embedding: number[], limit: number): Promise<KnowledgeEmbedding[]>;
}
