import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import type { PrismaClient } from '@prisma/client';

type RawKnowledgeEmbeddingRow = {
	id: string;
	knowledge_article_id: string;
	chunk_index: number;
	chunk_text: string;
	embedding: string;
	created_at: Date;
	updated_at: Date;
};

export class PrismaKnowledgeEmbeddingRepository implements KnowledgeEmbeddingRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async saveMany(embeddings: KnowledgeEmbedding[]): Promise<void> {
		if (embeddings.length === 0) return;

		for (const embedding of embeddings) {
			const vectorLiteral = `[${embedding.embedding.join(',')}]`;
			await this.prisma.$executeRaw`
				INSERT INTO knowledge_embeddings (id, knowledge_article_id, chunk_index, chunk_text, embedding, created_at, updated_at)
				VALUES (
					${embedding.id}::uuid,
					${embedding.knowledgeArticleId}::uuid,
					${embedding.chunkIndex},
					${embedding.chunkText},
					${vectorLiteral}::vector,
					${embedding.createdAt},
					${embedding.updatedAt}
				)
				ON CONFLICT (id) DO UPDATE SET
					chunk_index = EXCLUDED.chunk_index,
					chunk_text = EXCLUDED.chunk_text,
					embedding = EXCLUDED.embedding,
					updated_at = EXCLUDED.updated_at
			`;
		}
	}

	async deleteByArticleId(articleId: KnowledgeArticleId): Promise<void> {
		await this.prisma.$executeRaw`
			DELETE FROM knowledge_embeddings
			WHERE knowledge_article_id = ${articleId as string}::uuid
		`;
	}

	async searchSimilar(embedding: number[], limit: number): Promise<KnowledgeEmbedding[]> {
		const vectorLiteral = `[${embedding.join(',')}]`;
		const rows = await this.prisma.$queryRaw<RawKnowledgeEmbeddingRow[]>`
			SELECT
				id,
				knowledge_article_id,
				chunk_index,
				chunk_text,
				embedding::text,
				created_at,
				updated_at
			FROM knowledge_embeddings
			ORDER BY embedding <-> ${vectorLiteral}::vector
			LIMIT ${limit}
		`;

		return rows.map((row) => this.toDomain(row));
	}

	private toDomain(row: RawKnowledgeEmbeddingRow): KnowledgeEmbedding {
		const embeddingValues = row.embedding
			.replace(/^\[/, '')
			.replace(/\]$/, '')
			.split(',')
			.map(Number);

		return KnowledgeEmbedding.reconstruct({
			id: createKnowledgeEmbeddingId(row.id),
			knowledgeArticleId: createKnowledgeArticleId(row.knowledge_article_id),
			chunkIndex: row.chunk_index,
			chunkText: row.chunk_text,
			embedding: embeddingValues,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
}
