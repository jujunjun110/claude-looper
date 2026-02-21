# OpenAIEmbeddingGateway 実装

## タスク ID と内容
- タスク ID: `openai-embedding-gateway`
- `apps/content-reviewer/package.json` に `openai` パッケージを追加、`pnpm install` を実行
- `src/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway.ts` に `EmbeddingGateway` を implements した `OpenAIEmbeddingGateway` クラスを実装

## 作成・変更したファイル一覧
- `apps/content-reviewer/package.json` — `"openai": "^4.103.0"` を dependencies に追加
- `pnpm-lock.yaml` — openai パッケージのロック情報が追加
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway.ts` — 新規作成（実装本体）
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/__tests__/openai-embedding.gateway.test.ts` — 新規作成（ユニットテスト）

## 設計判断
- `shared/infrastructure/ai/` に配置 — architecture.md の「共通 Gateway interface 実装は shared/infrastructure/ai/」規約に従う
- `openai` SDK の `embeddings.create()` を呼び出し。model: `text-embedding-3-small`、dimensions: 1536 を指定
- `OPENAI_API_KEY` 環境変数をコンストラクタで `OpenAI` クライアントに渡す（プロセス起動時に環境変数を読む設計）
- テストは `vi.mock('openai')` で SDK 全体をモックし、API を呼ばずに実行可能

## 詰まった点・解決方法
- 特になし。既存の `SupabaseAuthGateway` のパターンに倣い実装
- e2e テストは既存からタイムアウトで失敗していた（ポート競合）ため、今回のタスクとは無関係

## 次のタスクへの申し送り
- `OpenAIEmbeddingGateway` は Composition Root（`knowledge.composition.ts` 等）で `new OpenAIEmbeddingGateway()` としてインスタンス化し、UseCase に注入する形で使用する
- 実運用環境では `OPENAI_API_KEY` を `.env.local` や Secret Manager に設定すること
