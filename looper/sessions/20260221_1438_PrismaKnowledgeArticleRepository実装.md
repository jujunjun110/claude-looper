# PrismaKnowledgeArticleRepository 実装

## タスク ID と内容

`prisma-knowledge-article-repository`: `src/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-article.repository.ts` に `PrismaKnowledgeArticleRepository` を実装。

## 作成・変更したファイル一覧

- **新規作成**: `apps/content-reviewer/src/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-article.repository.ts`
- **新規作成**: `apps/content-reviewer/src/backend/contexts/knowledge/infrastructure/repositories/__tests__/prisma-knowledge-article.repository.test.ts`

## 設計判断

- 既存の `PrismaExpressionRuleRepository` をパターンとして踏襲
- `toPrisma()` の `sourceType` フィールドは Prisma の `SourceType` 型（enum）にキャストが必要（`KnowledgeArticleSourceType` は `'manual' | 'note'` union type）
- `save()` は upsert（create + update）。update 時は title/content/sourceType/sourceUrl のみ更新（id/createdBy/createdAt は変更不可）
- `findAll()` は `createdAt: 'desc'` でソート（expression-rule と同様）

## 詰まった点・解決方法

- biome の import ソート順エラー → アルファベット順に並び替え
- `sourceType: string` 型不一致エラー → `import type { SourceType }` を追加して `as SourceType` でキャスト
- biome の `import type` 必須ルール + フォーマット（複数行展開）に対応

## 次のタスクへの申し送り

- infrastructure 層（PrismaKnowledgeArticleRepository）実装完了
- 次は knowledge context の UseCase（application 層）、または PrismaKnowledgeEmbeddingRepository の実装が想定される
- E2E テストのポート競合問題は引き続き既知の環境問題
