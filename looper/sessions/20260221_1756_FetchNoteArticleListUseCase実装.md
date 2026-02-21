# タスク: fetch-note-article-list-usecase

## タスク内容
`FetchNoteArticleListUseCase` を実装し、ユニットテストを追加する。

## 作成・変更したファイル

- **新規作成**: `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/fetch-note-article-list.usecase.ts`
  - クラスベース + `NoteScraperGateway` コンストラクタ DI
  - `execute(accountName: string): Promise<NoteArticleSummary[]>` を実装

- **新規作成**: `apps/content-reviewer/test/unit/contexts/knowledge/application/usecases/fetch-note-article-list.usecase.test.ts`
  - `NoteScraperGateway` をモック（vi.fn()）
  - 正常系（記事リスト返却）・空リストの2ケース

## 設計判断

- `docs/quality.md` に従い、テストは `__tests__/` ではなく `test/unit/contexts/knowledge/...` に配置
- UseCase は `NoteScraperGateway.fetchArticleList()` を単純に委譲するシンプルな実装
- Biome の import 順序ルールに従い `NoteArticleSummary` を先に並べ、複数行 import 形式を使用

## 詰まった点・解決方法

- `biome check` で import 順序・フォーマットエラー → 複数行 import + アルファベット順に修正して解消

## 次のタスクへの申し送り

- UseCase 実装完了。次は Note Scraper Gateway の infrastructure 実装（HTTP スクレイピング）が必要
- `pnpm verify` 全 pass 確認済み（217 tests）
