import { KnowledgeEmbedding } from '@/backend/contexts/knowledge/domain/models/knowledge-embedding.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import { describe, expect, it } from 'vitest';

const validArticleId = createKnowledgeArticleId('550e8400-e29b-41d4-a716-446655440000');
const validEmbeddingId = createKnowledgeEmbeddingId('660e8400-e29b-41d4-a716-446655440001');
const validEmbedding = Array.from({ length: 1536 }, (_, i) => i * 0.001);

describe('KnowledgeEmbedding', () => {
	describe('create', () => {
		it('should create a KnowledgeEmbedding with valid props', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 0,
				chunkText: 'チャンクテキスト',
				embedding: validEmbedding,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe(validEmbeddingId);
				expect(result.value.knowledgeArticleId).toBe(validArticleId);
				expect(result.value.chunkIndex).toBe(0);
				expect(result.value.chunkText).toBe('チャンクテキスト');
				expect(result.value.embedding).toEqual(validEmbedding);
			}
		});

		it('should fail when chunkIndex is negative', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: -1,
				chunkText: 'チャンクテキスト',
				embedding: validEmbedding,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Chunk index must be non-negative');
			}
		});

		it('should fail when chunkText is empty', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 0,
				chunkText: '',
				embedding: validEmbedding,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Chunk text cannot be empty');
			}
		});

		it('should fail when embedding is empty', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 0,
				chunkText: 'チャンクテキスト',
				embedding: [],
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Embedding must not be empty');
			}
		});

		it('should allow chunkIndex of 0', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 0,
				chunkText: 'テキスト',
				embedding: validEmbedding,
			});

			expect(result.success).toBe(true);
		});

		it('should fail when embedding dimension is not 1536', () => {
			const result = KnowledgeEmbedding.create({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 0,
				chunkText: 'チャンクテキスト',
				embedding: [0.1, 0.2, 0.3],
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Embedding must have 1536 dimensions, got 3');
			}
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a KnowledgeEmbedding from props', () => {
			const now = new Date();
			const embedding = KnowledgeEmbedding.reconstruct({
				id: validEmbeddingId,
				knowledgeArticleId: validArticleId,
				chunkIndex: 2,
				chunkText: '再構成テキスト',
				embedding: validEmbedding,
				createdAt: now,
				updatedAt: now,
			});

			expect(embedding.id).toBe(validEmbeddingId);
			expect(embedding.chunkIndex).toBe(2);
			expect(embedding.chunkText).toBe('再構成テキスト');
		});
	});
});
