# タスク: anthropic-ai-gateway

## タスク ID と内容
Anthropic Claude API の AIGateway 実装。`AnthropicAIGateway implements AIGateway` を shared/infrastructure/ai に作成。

## 作成・変更したファイル
- `apps/content-reviewer/package.json` — `@anthropic-ai/sdk: ^0.39.0` を dependencies に追加
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/anthropic-ai.gateway.ts` — AnthropicAIGateway 実装
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/__tests__/anthropic-ai.gateway.test.ts` — ユニットテスト（9テスト）

## 設計判断
- `generate()` は最初の text ブロックを返す（non-streaming messages.create）
- `generateWithWebSearch()` は最後の text ブロックを返す（web search 後にモデルが最終回答を text ブロックで返すため）
- `generateStream()` は messages.stream() + content_block_delta/text_delta イベントで yield
- web_search_20250305 ツールが SDK 0.39.0 の ToolUnion に未定義のため `as unknown as ToolUnion` でキャスト

## 詰まった点・解決方法
- pnpm install が ELOOP エラー: worktree の node_modules が循環 symlink になっていたため削除してから再 install
- `web_search_20250305` が TypeScript 型に未定義: SDK の ToolUnion には bash/text-editor のみ存在。`as unknown as Anthropic.Messages.ToolUnion` で型安全にキャスト

## 次のタスクへの申し送り
- AnthropicAIGateway は shared/infrastructure/ai/ に配置済み。各 Context の Composition Root で注入して使う
- ANTHROPIC_API_KEY 環境変数が必要（.env.local に設定要）
