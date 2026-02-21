import { ListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/application/usecases/list-knowledge-articles.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildArticle(idSuffix: string): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: createKnowledgeArticleId(`00000000-0000-0000-0000-00000000000${idSuffix}`),
		title: `タイトル${idSuffix}`,
		content: `コンテンツ${idSuffix}`,
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

describe('ListKnowledgeArticlesUseCase', () => {
	it('should return all knowledge articles', async () => {
		const articles = [buildArticle('1'), buildArticle('2'), buildArticle('3')];
		const articleRepository = createMockArticleRepository({
			findAll: vi.fn().mockResolvedValue(articles),
		});
		const useCase = new ListKnowledgeArticlesUseCase(articleRepository);

		const result = await useCase.execute();

		expect(result).toEqual(articles);
		expect(articleRepository.findAll).toHaveBeenCalledOnce();
	});

	it('should return empty array when no articles exist', async () => {
		const articleRepository = createMockArticleRepository({
			findAll: vi.fn().mockResolvedValue([]),
		});
		const useCase = new ListKnowledgeArticlesUseCase(articleRepository);

		const result = await useCase.execute();

		expect(result).toEqual([]);
		expect(articleRepository.findAll).toHaveBeenCalledOnce();
	});

	it('should propagate repository errors', async () => {
		const articleRepository = createMockArticleRepository({
			findAll: vi.fn().mockRejectedValue(new Error('DB error')),
		});
		const useCase = new ListKnowledgeArticlesUseCase(articleRepository);

		await expect(useCase.execute()).rejects.toThrow('DB error');
	});
});
