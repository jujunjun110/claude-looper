# 20260221_1756 ImportNoteArticlesUseCase 実装

## タスク ID と内容
- ID: `import-note-articles-usecase`
- NoteScraperGateway + KnowledgeArticleRepository + KnowledgeEmbeddingRepository + EmbeddingGateway を DI した ImportNoteArticlesUseCase を実装

## 作成・変更したファイル一覧
1. `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/import-note-articles.usecase.ts` (新規)
2. `apps/content-reviewer/test/unit/contexts/knowledge/application/usecases/import-note-articles.usecase.test.ts` (新規)

## 設計判断
- 既存の `CreateKnowledgeArticleUseCase` と同パターンで実装（クラスベース + コンストラクタ DI + execute()）
- `selectedUrls` をループで処理し、各 URL について `fetchArticleContent → KnowledgeArticle.create(sourceType: 'note') → articleRepository.save → generateEmbedding → KnowledgeEmbedding.create → embeddingRepository.saveMany` の順で実行
- テストは `docs/quality.md` の規約に従い `test/unit/` 配下に配置（既存の knowledge テストが `src/**/__tests__/` に置かれていたが、規約を優先）

## 詰まった点・解決方法
- タスク記述では `__tests__/` への配置が指示されていたが、`docs/quality.md` と主指示に「`test/unit/` に配置」と明記されていたため `test/unit/` を選択
- vitest.unit.config.ts が両ディレクトリを include しているので、どちらでも動作する

## 次のタスクへの申し送り
- presentation 層（composition.ts や actions）から ImportNoteArticlesUseCase を呼び出す実装が今後必要になる想定
- NoteScraperGateway の infrastructure 実装（実際の note スクレイピング）はまだ存在しない
