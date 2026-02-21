import { FetchNoteArticleListUseCase } from '@/backend/contexts/knowledge/application/usecases/fetch-note-article-list.usecase';
import type {
	NoteArticleSummary,
	NoteScraperGateway,
} from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import { describe, expect, it, vi } from 'vitest';

function createMockNoteScraperGateway(
	overrides: Partial<NoteScraperGateway> = {},
): NoteScraperGateway {
	return {
		fetchArticleList: vi.fn().mockResolvedValue([]),
		fetchArticleContent: vi.fn().mockResolvedValue({ title: '', content: '' }),
		...overrides,
	};
}

describe('FetchNoteArticleListUseCase', () => {
	it('should return article list from gateway', async () => {
		const articles: NoteArticleSummary[] = [
			{ title: '記事1', url: 'https://note.com/user/n/abc1', publishedAt: new Date('2024-01-01') },
			{ title: '記事2', url: 'https://note.com/user/n/abc2', publishedAt: new Date('2024-01-02') },
		];
		const gateway = createMockNoteScraperGateway({
			fetchArticleList: vi.fn().mockResolvedValue(articles),
		});
		const useCase = new FetchNoteArticleListUseCase(gateway);

		const result = await useCase.execute('testuser');

		expect(result).toEqual(articles);
		expect(gateway.fetchArticleList).toHaveBeenCalledOnce();
		expect(gateway.fetchArticleList).toHaveBeenCalledWith('testuser');
	});

	it('should return empty array when no articles exist', async () => {
		const gateway = createMockNoteScraperGateway({
			fetchArticleList: vi.fn().mockResolvedValue([]),
		});
		const useCase = new FetchNoteArticleListUseCase(gateway);

		const result = await useCase.execute('testuser');

		expect(result).toEqual([]);
		expect(gateway.fetchArticleList).toHaveBeenCalledOnce();
		expect(gateway.fetchArticleList).toHaveBeenCalledWith('testuser');
	});
});
