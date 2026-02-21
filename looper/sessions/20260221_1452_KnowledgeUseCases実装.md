# 20260221_1452 Knowledge UseCases 実装

## タスク ID と内容
`knowledge-usecases` — knowledge context の UseCase 4種（Create/Update/List/Delete）を実装。

## 作成・変更したファイル一覧
- `src/backend/contexts/knowledge/application/usecases/create-knowledge-article.usecase.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/update-knowledge-article.usecase.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/list-knowledge-articles.usecase.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/delete-knowledge-article.usecase.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/__tests__/create-knowledge-article.usecase.test.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/__tests__/update-knowledge-article.usecase.test.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/__tests__/list-knowledge-articles.usecase.test.ts` （新規）
- `src/backend/contexts/knowledge/application/usecases/__tests__/delete-knowledge-article.usecase.test.ts` （新規）
- `src/backend/contexts/knowledge/infrastructure/repositories/__tests__/prisma-knowledge-embedding.repository.test.ts` （既存テスト修正: embedding 次元数 3→1536）

## 設計判断
- タスク仕様通り、チャンク分割なし（chunkIndex=0, chunkText=article.content で全文1件の KnowledgeEmbedding）
- Create: save → generateEmbedding → saveMany の順（embedding 生成失敗時は article 保存済みだが許容）
- Update: findById → update → save → deleteByArticleId → generateEmbedding → saveMany の順（古い embedding 削除してから新 embedding を生成）
- Delete: findById でガード → deleteByArticleId → delete の順（embedding 先に削除してから article 削除）
- expression-rule usecase パターンに準拠: クラスベース + constructor DI + execute() メソッド

## 詰まった点・解決方法
- 既存の `prisma-knowledge-embedding.repository.test.ts` が `sampleEmbeddingValues = Array.from({ length: 3 })` でダミー 3 次元 embedding を使っており、KnowledgeEmbedding.create の 1536 次元バリデーションで失敗。→ 1536 次元に修正

## 次のタスクへの申し送り
- UseCase 層実装完了。次は presentation 層（composition / loaders / actions）の実装
- searchSimilar UseCase（ベクトル検索）は未実装（タスク仕様外）
