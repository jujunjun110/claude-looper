import { ImportNoteArticlesUseCase } from '@/backend/contexts/knowledge/application/usecases/import-note-articles.usecase';
import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import type { KnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository';
import type { NoteScraperGateway } from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const DUMMY_EMBEDDING = new Array(1536).fill(0.1);

function createMockNoteScraperGateway(
	overrides: Partial<NoteScraperGateway> = {},
): NoteScraperGateway {
	return {
		fetchArticleList: vi.fn().mockResolvedValue([]),
		fetchArticleContent: vi.fn().mockResolvedValue({ title: 'テスト記事', content: 'テスト内容' }),
		...overrides,
	};
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

describe('ImportNoteArticlesUseCase', () => {
	const createdBy = createUserId('user-123');

	it('should call fetchArticleContent for each selected URL', async () => {
		const noteScraper = createMockNoteScraperGateway();
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const selectedUrls = ['https://note.com/user/n/abc', 'https://note.com/user/n/def'];
		await useCase.execute({ selectedUrls, createdBy });

		expect(noteScraper.fetchArticleContent).toHaveBeenCalledTimes(2);
		expect(noteScraper.fetchArticleContent).toHaveBeenCalledWith(selectedUrls[0]);
		expect(noteScraper.fetchArticleContent).toHaveBeenCalledWith(selectedUrls[1]);
	});

	it('should call articleRepository.save for each article', async () => {
		const noteScraper = createMockNoteScraperGateway();
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const selectedUrls = ['https://note.com/user/n/abc'];
		await useCase.execute({ selectedUrls, createdBy });

		expect(articleRepository.save).toHaveBeenCalledOnce();
	});

	it('should call generateEmbedding for each article', async () => {
		const noteScraper = createMockNoteScraperGateway();
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const selectedUrls = ['https://note.com/user/n/abc', 'https://note.com/user/n/def'];
		await useCase.execute({ selectedUrls, createdBy });

		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledTimes(2);
	});

	it('should call embeddingRepository.saveMany for each article', async () => {
		const noteScraper = createMockNoteScraperGateway();
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const selectedUrls = ['https://note.com/user/n/abc'];
		await useCase.execute({ selectedUrls, createdBy });

		expect(embeddingRepository.saveMany).toHaveBeenCalledOnce();
		const [savedEmbeddings] = (embeddingRepository.saveMany as ReturnType<typeof vi.fn>).mock
			.calls[0];
		expect(savedEmbeddings).toHaveLength(1);
		expect(savedEmbeddings[0].embedding).toEqual(DUMMY_EMBEDDING);
	});

	it('should create articles with sourceType "note" and sourceUrl set to the URL', async () => {
		const noteScraper = createMockNoteScraperGateway({
			fetchArticleContent: vi
				.fn()
				.mockResolvedValue({ title: 'Note タイトル', content: 'Note 内容' }),
		});
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const url = 'https://note.com/user/n/abc';
		const results = await useCase.execute({ selectedUrls: [url], createdBy });

		expect(results).toHaveLength(1);
		expect(results[0].sourceType).toBe('note');
		expect(results[0].sourceUrl).toBe(url);
		expect(results[0].title).toBe('Note タイトル');
		expect(results[0].content).toBe('Note 内容');
		expect(results[0].createdBy).toBe(createdBy);
	});

	it('should return empty array when selectedUrls is empty', async () => {
		const noteScraper = createMockNoteScraperGateway();
		const articleRepository = createMockArticleRepository();
		const embeddingRepository = createMockEmbeddingRepository();
		const embeddingGateway = createMockEmbeddingGateway();
		const useCase = new ImportNoteArticlesUseCase(
			noteScraper,
			articleRepository,
			embeddingRepository,
			embeddingGateway,
		);

		const results = await useCase.execute({ selectedUrls: [], createdBy });

		expect(results).toHaveLength(0);
		expect(noteScraper.fetchArticleContent).not.toHaveBeenCalled();
		expect(articleRepository.save).not.toHaveBeenCalled();
		expect(embeddingGateway.generateEmbedding).not.toHaveBeenCalled();
		expect(embeddingRepository.saveMany).not.toHaveBeenCalled();
	});
});
