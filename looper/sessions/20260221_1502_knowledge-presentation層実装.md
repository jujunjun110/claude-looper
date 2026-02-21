# knowledge context presentation 層実装

## タスク ID
knowledge-presentation

## 内容
knowledge context の presentation 層（composition / loaders / actions）を実装。

## 作成・変更したファイル一覧

- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/composition/knowledge-article.composition.ts`
  - ファクトリ関数 4種: createListKnowledgeArticlesUseCase / createCreateKnowledgeArticleUseCase / createUpdateKnowledgeArticleUseCase / createDeleteKnowledgeArticleUseCase
  - PrismaKnowledgeArticleRepository + PrismaKnowledgeEmbeddingRepository + OpenAIEmbeddingGateway + prisma を注入

- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/loaders/knowledge-articles.loader.ts`
  - loadKnowledgeArticles(): UseCase 経由で一覧取得

- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/actions/create-knowledge-article.action.ts`
  - 'use server' Server Action。FormData (title, content, sourceType, sourceUrl) → UseCase → revalidatePath('/knowledge')

- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/actions/update-knowledge-article.action.ts`
  - 'use server' Server Action。FormData (id, title, content) → UseCase → revalidatePath('/knowledge')

- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/actions/delete-knowledge-article.action.ts`
  - 'use server' Server Action。FormData (id) → UseCase → revalidatePath('/knowledge')

## 設計判断

- expression-rule の presentation 層と同一パターンで実装（createRepository ヘルパーで依存を生成、composition からファクトリ関数をエクスポート）
- 開発環境ではダミーユーザー ID 'dummy-user-id' を使用（create action のみ createdBy が必要）
- KnowledgeArticleSourceType のバリデーションは action 内で文字列比較
- biome フォーマッターが 2引数の DeleteKnowledgeArticleUseCase を1行で書くよう要求したため修正

## 詰まった点・解決方法

- biome の行長制限により CreateDeleteKnowledgeArticleUseCase の2引数コンストラクタが1行にまとめられた。再フォーマット後に lint 通過

## 検証結果

- lint / typecheck / build / unit テスト: 全通過（215 tests passed）
- e2e: DATABASE_URL 未設定による既存の失敗（今回の変更と無関係）

## 次のタスクへの申し送り

- presentation 層が揃ったので /knowledge ページの UI コンポーネント実装（page.tsx + 一覧・フォームコンポーネント）が次のステップ
- loadKnowledgeArticles() を page.tsx から呼び出して表示する実装が未着手
