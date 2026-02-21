import { ListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/application/usecases/list-knowledge-articles.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

function buildArticle(title: string): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: createKnowledgeArticleId(
			`${Math.random().toString(16).slice(2).padEnd(8, '0').slice(0, 8)}-1111-1111-1111-111111111111`,
		),
		title,
		content: '本文',
		sourceType: 'manual',
		createdBy: createUserId('11111111-1111-1111-1111-111111111111'),
	});
	if (!result.success) throw new Error(result.error);
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
	it('should return all articles from repository', async () => {
		const articles = [buildArticle('記事1'), buildArticle('記事2')];
		const articleRepository = createMockArticleRepository({
			findAll: vi.fn().mockResolvedValue(articles),
		});
		const useCase = new ListKnowledgeArticlesUseCase(articleRepository);

		const result = await useCase.execute();

		expect(result).toBe(articles);
		expect(result).toHaveLength(2);
		expect(articleRepository.findAll).toHaveBeenCalledOnce();
	});

	it('should return empty array when no articles exist', async () => {
		const articleRepository = createMockArticleRepository();
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
