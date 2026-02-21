# タスク: note-import-presentation

## タスク ID と内容
- ID: `note-import-presentation`
- presentation 層に Note インポート機能を追加するタスク

## 作成・変更したファイル
- **更新**: `src/backend/contexts/knowledge/presentation/composition/knowledge-article.composition.ts`
  - `NoteScraperHttpGateway` import 追加
  - `FetchNoteArticleListUseCase` import 追加
  - `ImportNoteArticlesUseCase` import 追加
  - `createNoteScraperGateway()` private ヘルパー追加
  - `createFetchNoteArticleListUseCase()` export ファクトリ追加
  - `createImportNoteArticlesUseCase()` export ファクトリ追加（NoteScraperHttpGateway + PrismaKnowledgeArticleRepository + PrismaKnowledgeEmbeddingRepository + OpenAIEmbeddingGateway を注入）

- **新規作成**: `src/backend/contexts/knowledge/presentation/loaders/note-article-list.loader.ts`
  - `loadNoteArticles(accountName: string): Promise<NoteArticleSummary[]>`
  - `createFetchNoteArticleListUseCase()` 経由で UseCase を取得

- **新規作成**: `src/backend/contexts/knowledge/presentation/actions/import-note-articles.action.ts`
  - `'use server'` Server Action
  - `FormData` から `selectedUrls`（`getAll`）と `accountName` を受け取り
  - `ImportNoteArticlesUseCase.execute({ selectedUrls, createdBy })` を呼び出し
  - `revalidatePath('/knowledge')` を実行

## 設計判断
- `createNoteScraperGateway()` は private ヘルパーとして切り出し（`createArticleRepository` 等と同じパターン）
- `importNoteArticlesAction` での `accountName` は FormData に含むが、UseCase には渡さない（ImportNoteArticlesUseCase の execute() は selectedUrls + createdBy のみ受け取る）
- ダミーユーザー ID パターンは既存 action と統一

## 詰まった点・解決方法
特になし。既存コードのパターンをそのまま踏襲。

## 次のタスクへの申し送り
- UI 側 (`/knowledge/import` ページ) でこれらの loader / action を呼び出す実装が別途必要
- `pnpm verify` 全 pass 確認済み（lint / typecheck / build / 233 tests）
