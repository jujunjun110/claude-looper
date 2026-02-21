import type {
	NoteArticleSummary,
	NoteScraperGateway,
} from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';

export class FetchNoteArticleListUseCase {
	constructor(private readonly noteScraperGateway: NoteScraperGateway) {}

	async execute(accountName: string): Promise<NoteArticleSummary[]> {
		return this.noteScraperGateway.fetchArticleList(accountName);
	}
}
