import { randomUUID } from 'node:crypto';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import type { KnowledgeArticleSourceType } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export interface CreateKnowledgeArticleInput {
	id?: KnowledgeArticleId;
	title: string;
	content: string;
	sourceType: KnowledgeArticleSourceType;
	sourceUrl?: string | null;
	createdBy: UserId;
}

export class CreateKnowledgeArticleUseCase {
	constructor(
		private readonly articleRepository: KnowledgeArticleRepository,
		private readonly embeddingRepository: KnowledgeEmbeddingRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(input: CreateKnowledgeArticleInput): Promise<KnowledgeArticle> {
		const id = input.id ?? createKnowledgeArticleId(randomUUID());

		const articleResult = KnowledgeArticle.create({
			id,
			title: input.title,
			content: input.content,
			sourceType: input.sourceType,
			sourceUrl: input.sourceUrl,
			createdBy: input.createdBy,
		});

		if (!articleResult.success) {
			throw new Error(articleResult.error);
		}

		const article = articleResult.value;
		await this.articleRepository.save(article);

		const embeddingVector = await this.embeddingGateway.generateEmbedding(
			`${article.title}\n${article.content}`,
		);

		const embeddingResult = KnowledgeEmbedding.create({
			id: createKnowledgeEmbeddingId(randomUUID()),
			knowledgeArticleId: article.id,
			chunkIndex: 0,
			chunkText: `${article.title}\n${article.content}`,
			embedding: embeddingVector,
		});

		if (!embeddingResult.success) {
			throw new Error(embeddingResult.error);
		}

		await this.embeddingRepository.saveMany([embeddingResult.value]);

		return article;
	}
}
