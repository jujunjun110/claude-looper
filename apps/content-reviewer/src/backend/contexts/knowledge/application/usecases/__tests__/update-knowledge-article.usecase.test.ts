import { UpdateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/update-knowledge-article.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const DUMMY_EMBEDDING = new Array(1536).fill(0.2);

function buildExistingArticle(): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: createKnowledgeArticleId('00000000-0000-0000-0000-000000000001'),
		title: '元のタイトル',
		content: '元のコンテンツ',
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

function createMockEmbeddingGateway(overrides: Partial<EmbeddingGateway> = {}): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(DUMMY_EMBEDDING),
		...overrides,
	};
}

describe('UpdateKnowledgeArticleUseCase', () => {
	const articleId = createKnowledgeArticleId('00000000-0000-0000-0000-000000000001');

	it('should update and save an existing knowledge article', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const result = await useCase.execute({
			id: articleId,
			title: '新しいタイトル',
			content: '新しいコンテンツ',
		});

		expect(result.id).toBe(articleId);
		expect(result.title).toBe('新しいタイトル');
		expect(result.content).toBe('新しいコンテンツ');
		expect(articleRepository.findById).toHaveBeenCalledWith(articleId);
		expect(articleRepository.save).toHaveBeenCalledWith(result);
	});

	it('should regenerate embedding after update', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await useCase.execute({
			id: articleId,
			title: '新しいタイトル',
			content: '新しいコンテンツ',
		});

		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledOnce();
		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledWith(articleId);
		expect(embeddingRepository.saveMany).toHaveBeenCalledOnce();
	});

	it('should call deleteByArticleId before saveMany', async () => {
		const existing = buildExistingArticle();
		const callOrder: string[] = [];
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository({
			deleteByArticleId: vi.fn().mockImplementation(() => {
				callOrder.push('deleteByArticleId');
				return Promise.resolve();
			}),
			saveMany: vi.fn().mockImplementation(() => {
				callOrder.push('saveMany');
				return Promise.resolve();
			}),
		});
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await useCase.execute({
			id: articleId,
			title: '新しいタイトル',
			content: '新しいコンテンツ',
		});

		expect(callOrder).toEqual(['deleteByArticleId', 'saveMany']);
	});

	it('should preserve createdBy from existing article', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const result = await useCase.execute({
			id: articleId,
			title: '新しいタイトル',
			content: '新しいコンテンツ',
		});

		expect(result.createdBy).toBe(existing.createdBy);
	});

	it('should throw when article does not exist', async () => {
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(null),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: articleId,
				title: '新しいタイトル',
				content: '新しいコンテンツ',
			}),
		).rejects.toThrow(`KnowledgeArticle not found: ${articleId}`);

		expect(articleRepository.save).not.toHaveBeenCalled();
		expect(embeddingGateway.generateEmbedding).not.toHaveBeenCalled();
		expect(embeddingRepository.deleteByArticleId).not.toHaveBeenCalled();
		expect(embeddingRepository.saveMany).not.toHaveBeenCalled();
	});

	it('should throw when title is empty', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: articleId,
				title: '',
				content: '新しいコンテンツ',
			}),
		).rejects.toThrow('Title cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
	});

	it('should throw when content is empty', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: articleId,
				title: '新しいタイトル',
				content: '',
			}),
		).rejects.toThrow('Content cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
	});

	it('should propagate errors from embeddingGateway', async () => {
		const existing = buildExistingArticle();
		const articleRepository = createMockArticleRepository({
			findById: vi.fn().mockResolvedValue(existing),
		});
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway({
			generateEmbedding: vi.fn().mockRejectedValue(new Error('OpenAI error')),
		});
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: articleId,
				title: '新しいタイトル',
				content: '新しいコンテンツ',
			}),
		).rejects.toThrow('OpenAI error');
	});
});
