import type { NoteArticleSummary } from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import { createFetchNoteArticleListUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';

export async function loadNoteArticles(accountName: string): Promise<NoteArticleSummary[]> {
	const useCase = createFetchNoteArticleListUseCase();
	return useCase.execute(accountName);
}
