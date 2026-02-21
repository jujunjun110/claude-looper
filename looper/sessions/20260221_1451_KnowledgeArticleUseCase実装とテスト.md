# タスク: knowledge-usecase-tests

## タスク内容
KnowledgeArticle UseCase 4種のユニットテストを作成（UseCase本体も実装）。

## 作成・変更ファイル一覧

### 新規作成
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/create-knowledge-article.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/update-knowledge-article.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/list-knowledge-articles.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/delete-knowledge-article.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/__tests__/create-knowledge-article.usecase.test.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/__tests__/update-knowledge-article.usecase.test.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/__tests__/list-knowledge-articles.usecase.test.ts`
- `apps/content-reviewer/src/backend/contexts/knowledge/application/usecases/__tests__/delete-knowledge-article.usecase.test.ts`

### 修正
- `apps/content-reviewer/src/backend/contexts/knowledge/infrastructure/repositories/__tests__/prisma-knowledge-embedding.repository.test.ts`（sampleEmbeddingValues を3次元→1536次元に修正）

## 設計判断

- UseCase本体が未実装だったため、テストに先立ってUseCaseを4種実装
- CreateUseCase: articleRepository.save → embeddingGateway.generateEmbedding → embeddingRepository.saveMany の順序で実行
- UpdateUseCase: findById → update → articleRepository.save → embeddingRepository.deleteByArticleId → generateEmbedding → embeddingRepository.saveMany
- DeleteUseCase: embeddingRepository.deleteByArticleId → articleRepository.delete の順序（Embedding先削除でFK制約を避ける）
- テストでは呼び出し順序を callOrder 配列で検証

## 詰まった点・解決方法

- 既存の `prisma-knowledge-embedding.repository.test.ts` が3次元embeddinを使っており KnowledgeEmbedding.create() の1536次元バリデーションで失敗していた → 1536次元に修正

## 次のタスクへの申し送り

- UseCase 4種が揃ったので、次はpresentation層（composition / loaders / actions）の実装が可能
- KnowledgeArticle context の presentation層はまだ存在しない
