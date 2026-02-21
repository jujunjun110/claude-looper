import { CreateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/create-knowledge-article.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const DUMMY_EMBEDDING = new Array(1536).fill(0.1);

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

describe('CreateKnowledgeArticleUseCase', () => {
	const createdBy = createUserId('11111111-1111-1111-1111-111111111111');

	it('should create article, generate embedding, and save both', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const result = await useCase.execute({
			title: 'テスト記事',
			content: 'テスト本文',
			sourceType: 'manual',
			createdBy,
		});

		expect(result.title).toBe('テスト記事');
		expect(result.content).toBe('テスト本文');
		expect(result.sourceType).toBe('manual');
		expect(result.createdBy).toBe(createdBy);

		expect(articleRepository.save).toHaveBeenCalledOnce();
		expect(articleRepository.save).toHaveBeenCalledWith(result);

		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledOnce();
		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledWith('テスト本文');

		expect(embeddingRepository.saveMany).toHaveBeenCalledOnce();
		const savedEmbeddings = (embeddingRepository.saveMany as ReturnType<typeof vi.fn>).mock
			.calls[0][0];
		expect(savedEmbeddings).toHaveLength(1);
		expect(savedEmbeddings[0].knowledgeArticleId).toBe(result.id);
		expect(savedEmbeddings[0].chunkIndex).toBe(0);
		expect(savedEmbeddings[0].chunkText).toBe('テスト本文');
		expect(savedEmbeddings[0].embedding).toBe(DUMMY_EMBEDDING);
	});

	it('should accept custom id', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);
		const customId = createKnowledgeArticleId('22222222-2222-2222-2222-222222222222');

		const result = await useCase.execute({
			id: customId,
			title: 'テスト記事',
			content: 'テスト本文',
			sourceType: 'note',
			createdBy,
		});

		expect(result.id).toBe(customId);
	});

	it('should accept sourceUrl', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const result = await useCase.execute({
			title: 'テスト記事',
			content: 'テスト本文',
			sourceType: 'note',
			sourceUrl: 'https://example.com',
			createdBy,
		});

		expect(result.sourceUrl).toBe('https://example.com');
	});

	it('should throw when title is empty', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				title: '',
				content: 'テスト本文',
				sourceType: 'manual',
				createdBy,
			}),
		).rejects.toThrow('Title cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
		expect(embeddingGateway.generateEmbedding).not.toHaveBeenCalled();
		expect(embeddingRepository.saveMany).not.toHaveBeenCalled();
	});

	it('should throw when content is empty', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				title: 'テスト記事',
				content: '',
				sourceType: 'manual',
				createdBy,
			}),
		).rejects.toThrow('Content cannot be empty');

		expect(articleRepository.save).not.toHaveBeenCalled();
	});

	it('should propagate embedding gateway errors', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway({
			generateEmbedding: vi.fn().mockRejectedValue(new Error('API error')),
		});
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				title: 'テスト記事',
				content: 'テスト本文',
				sourceType: 'manual',
				createdBy,
			}),
		).rejects.toThrow('API error');
	});
});
