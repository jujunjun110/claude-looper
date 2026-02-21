import { NoteScraperHttpGateway } from '@/backend/contexts/knowledge/infrastructure/note-scraper.http-gateway';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SAMPLE_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>テストユーザーのnote</title>
    <link>https://note.com/testuser</link>
    <item>
      <title>記事タイトル1</title>
      <link>https://note.com/testuser/n/n001</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate>
    </item>
    <item>
      <title>記事タイトル2</title>
      <link>https://note.com/testuser/n/n002</link>
      <pubDate>Tue, 02 Jan 2024 00:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const SAMPLE_RSS_XML_SINGLE_ITEM = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>テストユーザーのnote</title>
    <link>https://note.com/testuser</link>
    <item>
      <title>唯一の記事</title>
      <link>https://note.com/testuser/n/n001</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>記事のタイトル</title>
    <style>body { color: red; }</style>
  </head>
  <body>
    <script>console.log("test");</script>
    <h1>見出し</h1>
    <p>本文テキスト1</p>
    <p>本文テキスト2</p>
  </body>
</html>`;

function mockFetchOnce(body: string, status = 200): void {
	vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(body, { status }));
}

describe('NoteScraperHttpGateway', () => {
	let gateway: NoteScraperHttpGateway;

	beforeEach(() => {
		gateway = new NoteScraperHttpGateway();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchArticleList', () => {
		it('should fetch RSS and return NoteArticleSummary[]', async () => {
			mockFetchOnce(SAMPLE_RSS_XML);

			const result = await gateway.fetchArticleList('testuser');

			expect(fetch).toHaveBeenCalledWith('https://note.com/testuser/rss');
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				title: '記事タイトル1',
				url: 'https://note.com/testuser/n/n001',
				publishedAt: new Date('Mon, 01 Jan 2024 00:00:00 +0000'),
			});
			expect(result[1]).toEqual({
				title: '記事タイトル2',
				url: 'https://note.com/testuser/n/n002',
				publishedAt: new Date('Tue, 02 Jan 2024 00:00:00 +0000'),
			});
		});

		it('should handle a single item (not array) in RSS feed', async () => {
			mockFetchOnce(SAMPLE_RSS_XML_SINGLE_ITEM);

			const result = await gateway.fetchArticleList('testuser');

			expect(result).toHaveLength(1);
			expect(result[0].title).toBe('唯一の記事');
		});

		it('should return empty array when no items in feed', async () => {
			const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty</title>
  </channel>
</rss>`;
			mockFetchOnce(emptyRss);

			const result = await gateway.fetchArticleList('testuser');

			expect(result).toEqual([]);
		});

		it('should throw when fetch returns non-ok status', async () => {
			mockFetchOnce('Not Found', 404);

			await expect(gateway.fetchArticleList('testuser')).rejects.toThrow(
				'Failed to fetch RSS feed: 404',
			);
		});

		it('should return publishedAt as Date instance', async () => {
			mockFetchOnce(SAMPLE_RSS_XML);

			const result = await gateway.fetchArticleList('testuser');

			expect(result[0].publishedAt).toBeInstanceOf(Date);
		});
	});

	describe('fetchArticleContent', () => {
		it('should fetch HTML and extract title and content', async () => {
			mockFetchOnce(SAMPLE_HTML);

			const result = await gateway.fetchArticleContent('https://note.com/testuser/n/n001');

			expect(fetch).toHaveBeenCalledWith('https://note.com/testuser/n/n001');
			expect(result.title).toBe('記事のタイトル');
			expect(result.content).toContain('本文テキスト1');
			expect(result.content).toContain('本文テキスト2');
		});

		it('should strip script tags from content', async () => {
			mockFetchOnce(SAMPLE_HTML);

			const result = await gateway.fetchArticleContent('https://note.com/testuser/n/n001');

			expect(result.content).not.toContain('console.log');
		});

		it('should strip style tags from content', async () => {
			mockFetchOnce(SAMPLE_HTML);

			const result = await gateway.fetchArticleContent('https://note.com/testuser/n/n001');

			expect(result.content).not.toContain('color: red');
		});

		it('should return empty title when no title tag found', async () => {
			const htmlWithoutTitle = '<html><body><p>内容</p></body></html>';
			mockFetchOnce(htmlWithoutTitle);

			const result = await gateway.fetchArticleContent('https://note.com/testuser/n/n001');

			expect(result.title).toBe('');
		});

		it('should throw when fetch returns non-ok status', async () => {
			mockFetchOnce('Internal Server Error', 500);

			await expect(gateway.fetchArticleContent('https://note.com/testuser/n/n001')).rejects.toThrow(
				'Failed to fetch article: 500',
			);
		});
	});
});
