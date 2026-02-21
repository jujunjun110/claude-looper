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
	const createdBy = createUserId('user-123');

	it('should create and save a knowledge article', async () => {
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
			content: 'テスト内容',
			sourceType: 'manual',
			createdBy,
		});

		expect(result.title).toBe('テスト記事');
		expect(result.content).toBe('テスト内容');
		expect(result.sourceType).toBe('manual');
		expect(result.createdBy).toBe(createdBy);
		expect(articleRepository.save).toHaveBeenCalledOnce();
		expect(articleRepository.save).toHaveBeenCalledWith(result);
	});

	it('should call EmbeddingGateway.generateEmbedding', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await useCase.execute({
			title: 'テスト記事',
			content: 'テスト内容',
			sourceType: 'manual',
			createdBy,
		});

		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledOnce();
	});

	it('should call embeddingRepository.saveMany after generating embedding', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await useCase.execute({
			title: 'テスト記事',
			content: 'テスト内容',
			sourceType: 'manual',
			createdBy,
		});

		expect(embeddingRepository.saveMany).toHaveBeenCalledOnce();
		const [savedEmbeddings] = (embeddingRepository.saveMany as ReturnType<typeof vi.fn>).mock
			.calls[0];
		expect(savedEmbeddings).toHaveLength(1);
		expect(savedEmbeddings[0].embedding).toEqual(DUMMY_EMBEDDING);
	});

	it('should call articleRepository.save before embeddingRepository.saveMany', async () => {
		const callOrder: string[] = [];
		const articleRepository = createMockArticleRepository({
			save: vi.fn().mockImplementation(() => {
				callOrder.push('articleSave');
				return Promise.resolve();
			}),
		});
		const embeddingRepository = createMockEmbeddingRepository({
			saveMany: vi.fn().mockImplementation(() => {
				callOrder.push('embeddingSaveMany');
				return Promise.resolve();
			}),
		});
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await useCase.execute({
			title: 'テスト記事',
			content: 'テスト内容',
			sourceType: 'manual',
			createdBy,
		});

		expect(callOrder).toEqual(['articleSave', 'embeddingSaveMany']);
	});

	it('should use provided id when given', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);
		const id = createKnowledgeArticleId('00000000-0000-0000-0000-000000000001');

		const result = await useCase.execute({
			id,
			title: 'テスト記事',
			content: 'テスト内容',
			sourceType: 'manual',
			createdBy,
		});

		expect(result.id).toBe(id);
	});

	it('should create article with sourceUrl', async () => {
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
			content: 'テスト内容',
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
				content: 'テスト内容',
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
		expect(embeddingGateway.generateEmbedding).not.toHaveBeenCalled();
		expect(embeddingRepository.saveMany).not.toHaveBeenCalled();
	});

	it('should propagate errors from embeddingGateway', async () => {
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway({
			generateEmbedding: vi.fn().mockRejectedValue(new Error('OpenAI error')),
		});
		const useCase = new CreateKnowledgeArticleUseCase(
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		await expect(
			useCase.execute({
				title: 'テスト記事',
				content: 'テスト内容',
				sourceType: 'manual',
				createdBy,
			}),
		).rejects.toThrow('OpenAI error');
	});
});
