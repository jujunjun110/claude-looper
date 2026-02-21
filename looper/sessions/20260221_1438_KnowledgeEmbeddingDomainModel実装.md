# 20260221_1438 KnowledgeEmbedding Domain Model 実装

## タスク ID と内容
- タスク ID: knowledge-embedding-domain-model
- 内容: KnowledgeEmbedding Rich Domain Model に embedding 次元数（1536）バリデーションを追加し、ユニットテストを実装

## 作成・変更したファイル
- `apps/content-reviewer/src/backend/contexts/knowledge/domain/models/knowledge-embedding.model.ts`
  - `create()` に embedding の次元数（1536）バリデーションを追加
- `apps/content-reviewer/src/backend/contexts/knowledge/domain/models/__tests__/knowledge-embedding.model.test.ts`
  - `should allow chunkIndex of 0` テストの embedding を `validEmbedding`（1536次元）に変更
  - 次元数バリデーションエラーのテストケース追加（3要素配列→失敗・エラーメッセージ確認）

## 設計判断
- 既存コード（`b44c48e` コミット）では `embedding.length !== 0` チェックのみで1536次元チェックが未実装だった
- `create()` に `props.embedding.length !== 1536` のチェックを追加し、失敗時は `{ success: false, error: "Embedding must have 1536 dimensions, got N" }` を返す
- biome フォーマッタの要件に合わせて return 文を複数行に展開
- 既存テストの `should allow chunkIndex of 0` が `[0.1, 0.2]` という 2 要素配列を使っていたため、1536次元配列（`validEmbedding`）に修正

## 詰まった点・解決方法
- biome lint（formatter）エラー: 1行の return 文が長すぎてフォーマットエラーになったため、複数行に展開して解決
- `pnpm verify` の E2E テストがポート競合でタイムアウト → 環境固有の問題（ポート3000 が既使用）でこのタスクとは無関係。lint/typecheck/build/unit test は全て pass

## 次のタスクへの申し送り
- `pnpm e2e` は環境ポート競合で失敗するが、本タスクの変更とは無関係
- KnowledgeArticle Domain Model の実装も同様のパターン（次元数バリデーションはなし）
- 次は knowledge-article-domain-model タスクか knowledge-embedding-usecase タスクが続く可能性あり
