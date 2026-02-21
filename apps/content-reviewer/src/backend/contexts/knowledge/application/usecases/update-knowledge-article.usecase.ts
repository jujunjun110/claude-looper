import { randomUUID } from 'node:crypto';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import type { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';

export interface UpdateKnowledgeArticleInput {
	id: KnowledgeArticleId;
	title: string;
	content: string;
}

export class UpdateKnowledgeArticleUseCase {
	constructor(
		private readonly articleRepository: KnowledgeArticleRepository,
		private readonly embeddingRepository: KnowledgeEmbeddingRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(input: UpdateKnowledgeArticleInput): Promise<KnowledgeArticle> {
		const existing = await this.articleRepository.findById(input.id);

		if (!existing) {
			throw new Error(`KnowledgeArticle not found: ${input.id}`);
		}

		const updateResult = existing.update({
			title: input.title,
			content: input.content,
		});

		if (!updateResult.success) {
			throw new Error(updateResult.error);
		}

		const updated = updateResult.value;
		await this.articleRepository.save(updated);

		await this.embeddingRepository.deleteByArticleId(updated.id);

		const embeddingVector = await this.embeddingGateway.generateEmbedding(updated.content);

		const embeddingResult = KnowledgeEmbedding.create({
			id: createKnowledgeEmbeddingId(randomUUID()),
			knowledgeArticleId: updated.id,
			chunkIndex: 0,
			chunkText: updated.content,
			embedding: embeddingVector,
		});

		if (!embeddingResult.success) {
			throw new Error(embeddingResult.error);
		}

		await this.embeddingRepository.saveMany([embeddingResult.value]);

		return updated;
	}
}
