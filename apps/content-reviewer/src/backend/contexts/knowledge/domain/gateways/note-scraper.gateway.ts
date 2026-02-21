export type NoteArticleSummary = {
	title: string;
	url: string;
	publishedAt: Date;
};

export interface NoteScraperGateway {
	fetchArticleList(accountName: string): Promise<NoteArticleSummary[]>;
	fetchArticleContent(url: string): Promise<{ title: string; content: string }>;
}
