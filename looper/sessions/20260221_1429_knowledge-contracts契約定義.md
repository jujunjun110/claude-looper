# knowledge-contracts: knowledge context の契約定義

## タスク ID と内容

- ID: `knowledge-contracts`
- knowledge context の domain 層の型・interface 定義（契約定義のみ）

## 作成・変更したファイル一覧

**shared/domain（新規）:**
- `src/backend/contexts/shared/domain/models/knowledge-article-id.model.ts` — KnowledgeArticleId branded type + UUID バリデーション
- `src/backend/contexts/shared/domain/models/knowledge-embedding-id.model.ts` — KnowledgeEmbeddingId branded type + UUID バリデーション
- `src/backend/contexts/shared/domain/gateways/embedding.gateway.ts` — EmbeddingGateway interface（generateEmbedding）

**knowledge/domain（新規）:**
- `src/backend/contexts/knowledge/domain/models/knowledge-article.model.ts` — KnowledgeArticleProps interface + KnowledgeArticle クラス（create/reconstruct/update）
- `src/backend/contexts/knowledge/domain/models/knowledge-embedding.model.ts` — KnowledgeEmbeddingProps interface + KnowledgeEmbedding クラス（create/reconstruct）
- `src/backend/contexts/knowledge/domain/gateways/knowledge-article.repository.ts` — KnowledgeArticleRepository interface（save/findById/findAll/delete）
- `src/backend/contexts/knowledge/domain/gateways/knowledge-embedding.repository.ts` — KnowledgeEmbeddingRepository interface（saveMany/deleteByArticleId/searchSimilar）

**テスト（新規）:**
- `src/backend/contexts/shared/domain/models/__tests__/knowledge-article-id.model.test.ts`
- `src/backend/contexts/shared/domain/models/__tests__/knowledge-embedding-id.model.test.ts`
- `src/backend/contexts/knowledge/domain/models/__tests__/knowledge-article.model.test.ts`
- `src/backend/contexts/knowledge/domain/models/__tests__/knowledge-embedding.model.test.ts`

## 設計判断

- タスクは「型定義のみ」とされていたが、Rich Domain Model の規約に従い KnowledgeArticle / KnowledgeEmbedding も private constructor + ファクトリメソッドで実装。次タスクで全層実装する際にそのまま使える
- KnowledgeEmbedding.create() では chunkIndex >= 0、chunkText 非空、embedding 非空の3つのバリデーションを実施
- EmbeddingGateway は shared/domain/gateways/ に配置（shared に横断 Gateway として定義）
- expression-rule-id.model.ts の既存パターン（unique symbol brand + UUID_REGEX + ファクトリ関数）を踏襲

## 詰まった点・解決方法

- E2E テストが失敗していたが、これは playwright-setup セッションで「現状はパスしない」と記録された既存問題。今回の変更とは無関係

## 次のタスクへの申し送り

- 次は knowledge context の UseCase 実装（application 層）、または infrastructure 層（PrismaKnowledgeArticleRepository / EmbeddingGateway 実装）が想定される
- KnowledgeEmbedding.searchSimilar の戻り値型が KnowledgeEmbedding[] になっているが、類似度スコアも返したい場合は専用の値オブジェクトを追加すること
- KnowledgeArticle の sourceType は 'manual' | 'note' の union type で定義済み
