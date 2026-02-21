import { randomUUID } from 'node:crypto';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import type { NoteScraperGateway } from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export interface ImportNoteArticlesInput {
	selectedUrls: string[];
	createdBy: UserId;
}

export class ImportNoteArticlesUseCase {
	constructor(
		private readonly noteScraperGateway: NoteScraperGateway,
		private readonly articleRepository: KnowledgeArticleRepository,
		private readonly embeddingRepository: KnowledgeEmbeddingRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(input: ImportNoteArticlesInput): Promise<KnowledgeArticle[]> {
		const articles: KnowledgeArticle[] = [];

		for (const url of input.selectedUrls) {
			const { title, content } = await this.noteScraperGateway.fetchArticleContent(url);

			const articleResult = KnowledgeArticle.create({
				id: createKnowledgeArticleId(randomUUID()),
				title,
				content,
				sourceType: 'note',
				sourceUrl: url,
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

			articles.push(article);
		}

		return articles;
	}
}
