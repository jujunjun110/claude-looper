import { UpdateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/update-knowledge-article.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const DUMMY_EMBEDDING = new Array(1536).fill(0.2);

const ARTICLE_ID = createKnowledgeArticleId('33333333-3333-3333-3333-333333333333');
const CREATED_BY = createUserId('11111111-1111-1111-1111-111111111111');

function buildExistingArticle(): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: ARTICLE_ID,
		title: '元のタイトル',
		content: '元の本文',
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

function createMockEmbeddingGateway(overrides: Partial<EmbeddingGateway> = {}): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(DUMMY_EMBEDDING),
		...overrides,
	};
}

describe('UpdateKnowledgeArticleUseCase', () => {
	it('should update article, delete old embeddings, and save new embedding', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const result = await useCase.execute({
			id: ARTICLE_ID,
			title: '新しいタイトル',
			content: '新しい本文',
		});

		expect(result.title).toBe('新しいタイトル');
		expect(result.content).toBe('新しい本文');
		expect(result.id).toBe(ARTICLE_ID);

		expect(articleRepository.save).toHaveBeenCalledOnce();
		expect(articleRepository.save).toHaveBeenCalledWith(result);

		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledOnce();
		expect(embeddingRepository.deleteByArticleId).toHaveBeenCalledWith(ARTICLE_ID);

		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledOnce();
		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledWith('新しい本文');

		expect(embeddingRepository.saveMany).toHaveBeenCalledOnce();
		const savedEmbeddings = (embeddingRepository.saveMany as ReturnType<typeof vi.fn>).mock
			.calls[0][0];
		expect(savedEmbeddings).toHaveLength(1);
		expect(savedEmbeddings[0].chunkText).toBe('新しい本文');
	});

	it('should throw when article not found', async () => {
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
				id: ARTICLE_ID,
				title: '新しいタイトル',
				content: '新しい本文',
			}),
		).rejects.toThrow(`KnowledgeArticle not found: ${ARTICLE_ID}`);

		expect(articleRepository.save).not.toHaveBeenCalled();
		expect(embeddingRepository.deleteByArticleId).not.toHaveBeenCalled();
	});

	it('should throw when updated title is empty', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: ARTICLE_ID,
				title: '',
				content: '新しい本文',
			}),
		).rejects.toThrow('Title cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
	});

	it('should throw when updated content is empty', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				id: ARTICLE_ID,
				title: '新しいタイトル',
				content: '',
			}),
		).rejects.toThrow('Content cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
	});
});
