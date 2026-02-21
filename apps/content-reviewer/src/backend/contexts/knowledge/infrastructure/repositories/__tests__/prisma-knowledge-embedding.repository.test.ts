import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaKnowledgeEmbeddingRepository } from '../prisma-knowledge-embedding.repository';

const articleId = createKnowledgeArticleId('550e8400-e29b-41d4-a716-446655440000');
const embeddingId1 = createKnowledgeEmbeddingId('660e8400-e29b-41d4-a716-446655440001');
const embeddingId2 = createKnowledgeEmbeddingId('660e8400-e29b-41d4-a716-446655440002');
const sampleEmbeddingValues = Array.from({ length: 3 }, (_, i) => (i + 1) * 0.1);

function makeEmbedding(
	id: ReturnType<typeof createKnowledgeEmbeddingId>,
	chunkIndex: number,
): KnowledgeEmbedding {
	const result = KnowledgeEmbedding.create({
		id,
		knowledgeArticleId: articleId,
		chunkIndex,
		chunkText: `chunk text ${chunkIndex}`,
		embedding: sampleEmbeddingValues,
	});
	if (!result.success) throw new Error(result.error);
	return result.value;
}

describe('PrismaKnowledgeEmbeddingRepository', () => {
	let prismaMock: {
		$executeRaw: ReturnType<typeof vi.fn>;
		$queryRaw: ReturnType<typeof vi.fn>;
	};
	let repository: PrismaKnowledgeEmbeddingRepository;

	beforeEach(() => {
		prismaMock = {
			$executeRaw: vi.fn().mockResolvedValue(1),
			$queryRaw: vi.fn().mockResolvedValue([]),
		};
		repository = new PrismaKnowledgeEmbeddingRepository(prismaMock as unknown as PrismaClient);
	});

	describe('saveMany', () => {
		it('should call $executeRaw for each embedding', async () => {
			const embeddings = [makeEmbedding(embeddingId1, 0), makeEmbedding(embeddingId2, 1)];

			await repository.saveMany(embeddings);

			expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(2);
		});

		it('should do nothing when given an empty array', async () => {
			await repository.saveMany([]);

			expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
		});
	});

	describe('deleteByArticleId', () => {
		it('should call $executeRaw with the articleId', async () => {
			await repository.deleteByArticleId(articleId);

			expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
		});
	});

	describe('searchSimilar', () => {
		it('should return KnowledgeEmbedding instances from raw rows', async () => {
			const now = new Date();
			const rawRows = [
				{
					id: embeddingId1,
					knowledge_article_id: articleId,
					chunk_index: 0,
					chunk_text: 'chunk text 0',
					embedding: '[0.1,0.2,0.3]',
					created_at: now,
					updated_at: now,
				},
			];
			prismaMock.$queryRaw.mockResolvedValue(rawRows);

			const results = await repository.searchSimilar(sampleEmbeddingValues, 5);

			expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
			expect(results).toHaveLength(1);
			expect(results[0]).toBeInstanceOf(KnowledgeEmbedding);
			expect(results[0].id).toBe(embeddingId1);
			expect(results[0].knowledgeArticleId).toBe(articleId);
			expect(results[0].chunkIndex).toBe(0);
			expect(results[0].chunkText).toBe('chunk text 0');
			expect(results[0].embedding).toEqual([0.1, 0.2, 0.3]);
		});

		it('should return empty array when no results', async () => {
			prismaMock.$queryRaw.mockResolvedValue([]);

			const results = await repository.searchSimilar(sampleEmbeddingValues, 5);

			expect(results).toHaveLength(0);
		});
	});
});
