import { DeleteKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/delete-knowledge-article.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildExistingArticle(): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: createKnowledgeArticleId('00000000-0000-0000-0000-000000000001'),
		title: 'テスト記事',
		content: 'テストコンテンツ',
		sourceType: 'manual',
		createdBy: createUserId('user-123'),
	});

	if (!result.success) {
		throw new Error('Failed to build test fixture');
	}

	return result.value;
}

function createMockArticleRepository(
	overrides: Partial<KnowledgeArticleRepository> = {},
): KnowledgeArticleRepository {
	return {
		save: vi.fn().mockResolvedValue(undefined),
		findById: vi.fn().mockResolvedValue(null),
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
	const articleId = createKnowledgeArticleId('00000000-0000-0000-0000-000000000001');

	it('should delete an existing knowledge article', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await useCase.execute(articleId);

		expect(articleRepository.findById).toHaveBeenCalledWith(articleId);
		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledWith(articleId);
		expect(articleRepository.delete).toHaveBeenCalledWith(articleId);
	});

	it('should call deleteByArticleId before delete (order verification)', async () => {
		const existing = buildExistingArticle();
		const callOrder: string[] = [];
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
			delete: vi.fn().mockImplementation(() => {
				callOrder.push('delete');
				return Promise.resolve();
			}),
		});
		const embeddingRepository = createMockEmbeddingRepository({
			deleteByArticleId: vi.fn().mockImplementation(() => {
				callOrder.push('deleteByArticleId');
				return Promise.resolve();
			}),
		});
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await useCase.execute(articleId);

		expect(callOrder).toEqual(['deleteByArticleId', 'delete']);
	});

	it('should throw when article does not exist', async () => {
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await expect(useCase.execute(articleId)).rejects.toThrow(
			`KnowledgeArticle not found: ${articleId}`,
		);

		expect(embeddingRepository.deleteByArticleId).not.toHaveBeenCalled();
		expect(articleRepository.delete).not.toHaveBeenCalled();
	});

	it('should propagate errors from embeddingRepository.deleteByArticleId', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository({
			deleteByArticleId: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await expect(useCase.execute(articleId)).rejects.toThrow('DB error');

		expect(articleRepository.delete).not.toHaveBeenCalled();
	});

	it('should propagate errors from articleRepository.delete', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
			delete: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const useCase = new DeleteKnowledgeArticleUseCase(articleRepository, embeddingRepository);

		await expect(useCase.execute(articleId)).rejects.toThrow('DB error');
	});
});
