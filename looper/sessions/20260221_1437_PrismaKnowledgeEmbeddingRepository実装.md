# prisma-knowledge-embedding-repository: PrismaKnowledgeEmbeddingRepository 実装

## タスク ID と内容

- ID: `prisma-knowledge-embedding-repository`
- `src/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-embedding.repository.ts` に `PrismaKnowledgeEmbeddingRepository` を実装

## 作成・変更したファイル一覧

**新規作成:**
- `src/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-embedding.repository.ts` — PrismaKnowledgeEmbeddingRepository 実装
- `src/backend/contexts/knowledge/infrastructure/repositories/__tests__/prisma-knowledge-embedding.repository.test.ts` — ユニットテスト（5テスト）

## 設計判断

- `KnowledgeEmbedding.embedding` が Prisma schema で `Unsupported("vector(1536)")` のため、`createMany` が使えない → `$executeRaw` で1件ずつ INSERT ON CONFLICT DO UPDATE
- `searchSimilar` は pgvector の `<->` 演算子（コサイン距離）を `$queryRaw` で実装。`embedding::text` でキャストして取得し、`toDomain` で数値配列に変換
- `deleteByArticleId` も `$executeRaw` で直接 DELETE
- `prisma-expression-rule.repository.ts` と同パターンで `toDomain` private メソッドに ORM→ドメイン変換を集約
- 共有 `prisma-client.ts` の `PrismaClient` を constructor DI で受け取る

## 詰まった点・解決方法

- biome フォーマッタが関数シグネチャの長さに対してエラー → 引数を複数行に分割して解決
- E2E テストはポート3000競合で失敗（既存環境問題、本実装とは無関係）

## 次のタスクへの申し送り

- `saveMany` は現在ループで1件ずつ $executeRaw を呼ぶ。バルク INSERT が必要な場合は SQL を書き直すこと
- `searchSimilar` の embedding 文字列パース（`[0.1,0.2,...]` 形式）は pgvector の出力フォーマット依存。変更があれば `toDomain` の parseEmbedding ロジックを修正すること
- 次は KnowledgeArticleRepository の実装（`prisma-knowledge-article.repository.ts`）または UseCase 実装が想定される
