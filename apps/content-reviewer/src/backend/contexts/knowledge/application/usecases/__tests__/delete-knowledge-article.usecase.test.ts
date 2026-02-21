import { DeleteKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/delete-knowledge-article.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const ARTICLE_ID = createKnowledgeArticleId('44444444-4444-4444-4444-444444444444');
const CREATED_BY = createUserId('11111111-1111-1111-1111-111111111111');

function buildExistingArticle(): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: ARTICLE_ID,
		title: 'テスト記事',
		content: 'テスト本文',
		sourceType: 'manual',
		createdBy: CREATED_BY,
	});
	if (!result.success) throw new Error(result.error);
	return result.value;
}

function createMockArticleRepository(
	overrides: Partial<KnowledgeArticleRepository> = {},
): KnowledgeArticleRepository {
	return {
		save: vi.fn().mockResolvedValue(undefined),
		findById: vi.fn().mockResolvedValue(buildExistingArticle()),
		findAll: vi.fn().mockResolvedValue([]),
		delete: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function createMockEmbeddingRepository(
	overrides: Partial<KnowledgeEmbeddingRepository> = {},
): KnowledgeEmbeddingRepository {
	return {
		saveMany: vi.fn().mockResolvedValue(undefined),
		deleteByArticleId: vi.fn().mockResolvedValue(undefined),
		searchSimilar: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

describe('DeleteKnowledgeArticleUseCase', () => {
	it('should delete embeddings then delete article', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await useCase.execute(ARTICLE_ID);

		expect(articleRepository.findById).toHaveBeenCalledOnce();
		expect(articleRepository.findById).toHaveBeenCalledWith(ARTICLE_ID);

		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledOnce();
		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledWith(ARTICLE_ID);

		expect(articleRepository.delete).toHaveBeenCalledOnce();
		expect(articleRepository.delete).toHaveBeenCalledWith(ARTICLE_ID);
	});

	it('should throw when article not found', async () => {
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await expect(useCase.execute(ARTICLE_ID)).rejects.toThrow(
			`KnowledgeArticle not found: ${ARTICLE_ID}`,
		);

		expect(embeddingRepository.deleteByArticleId).not.toHaveBeenCalled();
		expect(articleRepository.delete).not.toHaveBeenCalled();
	});

	it('should propagate repository errors', async () => {
		const articleRepository = createMockArticleRepository({
			delete: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await expect(useCase.execute(ARTICLE_ID)).rejects.toThrow('DB error');
	});
});
