import type {
	NoteArticleSummary,
	NoteScraperGateway,
} from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import { XMLParser } from 'fast-xml-parser';

type RssItem = {
	title: string;
	link: string;
	pubDate: string;
};

export class NoteScraperHttpGateway implements NoteScraperGateway {
	async fetchArticleList(accountName: string): Promise<NoteArticleSummary[]> {
		const url = `https://note.com/${accountName}/rss`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch RSS feed: ${response.status}`);
		}

		const xml = await response.text();
		const parser = new XMLParser({ ignoreAttributes: false });
		const parsed = parser.parse(xml) as {
			rss?: { channel?: { item?: RssItem | RssItem[] } };
		};

		const items = parsed?.rss?.channel?.item ?? [];
		const itemsArray: RssItem[] = Array.isArray(items) ? items : [items];

		return itemsArray.map((item) => ({
			title: item.title,
			url: item.link,
			publishedAt: new Date(item.pubDate),
		}));
	}

	async fetchArticleContent(url: string): Promise<{ title: string; content: string }> {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch article: ${response.status}`);
		}

		const html = await response.text();

		const title = this.extractTitle(html);
		const content = this.extractContent(html);

		return { title, content };
	}

	private extractTitle(html: string): string {
		const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		return match ? match[1].trim() : '';
	}

	private extractContent(html: string): string {
		const withoutScript = html.replace(/<script[\s\S]*?<\/script>/gi, '');
		const withoutStyle = withoutScript.replace(/<style[\s\S]*?<\/style>/gi, '');
		const withoutTags = withoutStyle.replace(/<[^>]+>/g, ' ');
		return withoutTags.replace(/\s+/g, ' ').trim();
	}
}
