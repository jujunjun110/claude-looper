import type { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';

export interface KnowledgeArticleRepository {
	save(article: KnowledgeArticle): Promise<void>;
	findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null>;
	findAll(): Promise<KnowledgeArticle[]>;
	delete(id: KnowledgeArticleId): Promise<void>;
}
