# claude-looper

Claude Code による自律開発ループ。3 エージェント（計画→並列実装→検証）が Milestone 単位で開発を進めます。

ブログ記事の補足資料として公開しています。汎用ライブラリではありません。自分のプロジェクトに合わせて自由に改変してください。

## 仕組み

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Planner  │────▶│ Builder  │────▶│ Verifier │
│ タスク設計 │     │ 並列実装  │     │ マージ検証 │
└──────────┘     └──────────┘     └──────────┘
                       │                │
                       │          失敗時 fix タスク追加
                       │                │
                       ◀────────────────┘
```

| エージェント | 役割 |
|---|---|
| **Planner** | Milestone のゴールを Wave 構造のタスクに分解する。コードは書かない |
| **Builder** | 1 タスク = 1 セッション。Git worktree で隔離して最大 8 並列で実行 |
| **Verifier** | ブランチを直列マージし品質検証。失敗時は fix タスクを生成してリトライ |

スクリプト（bash）が担うのは worktree 作成とプロセス起動だけ。判断は全てエージェントが行います。

### Milestone と Wave

- **Milestone** — 「1 つの機能が動く」単位。直列に進む（M1 完了 → M2 開始）
- **Wave** — Milestone 内の依存順序。同 Wave のタスクは Git worktree で並列実行される

```
Milestone 1
  Wave 1: interface / 型定義（契約）
  Wave 2: 独立した実装を並列実行
  Wave 3: 統合・テスト
Milestone 2
  ...
```

### 検証の 2 段階

| コマンド | 実行者 | 内容 | DB 必要 |
|---|---|---|---|
| `pnpm verify` | Builder | lint → prisma generate → typecheck → build → unit test | No |
| `pnpm verify:full` | Verifier | `pnpm verify` + E2E テスト | Yes（ローカル Supabase） |

Builder は worktree で動くため DB 不要の `pnpm verify` でセルフチェック。Verifier は本体ブランチで `pnpm verify:full`（E2E あり）で完全検証する。

### 自己修復

Verifier の検証が失敗すると fix タスクが自動生成され、次のラウンドで Builder がリトライします。

## 使い方

### 1. 設計ドキュメントを作成する

Claude Code で `/plan` コマンドを実行し、作りたいものを伝えます。

```
/plan 以下のアプリケーションの設計を行って。...（要件を記述）
```

入力例は [initial_prompt_sample.md](initial_prompt_sample.md) を参照。出力は `docs/tasks/` に保存されます。

### 2. Milestone を生成する

`/gen-milestones` コマンドに設計ドキュメントを渡し、`looper/milestones.json` を生成します。

```
/gen-milestones docs/tasks/設計ドキュメント.md
```

### 3. ループを実行する

```bash
bash looper/run.sh

# ドライラン（実行計画の確認のみ）
bash looper/run.sh --dry-run

# 別ターミナルで監視
watch -n3 bash looper/monitor.sh
```

## 前提

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
- jq
- Git
- [Playwright MCP](https://github.com/anthropics/playwright-mcp)（任意 — UI 動作確認・録画に使用）

## ファイル構成

```
looper/
├── run.sh              # オーケストレーション（worktree 作成・プロセス起動）
├── monitor.sh          # Builder セッションのリアルタイム監視
├── milestones.json     # Milestone / Task の定義と進捗
├── prompts/
│   ├── planner.md      # Planner エージェントプロンプト
│   ├── builder.md      # Builder エージェントプロンプト
│   └── verifier.md     # Verifier エージェントプロンプト
├── output/             # Verifier が保存する UI 動作確認の録画
└── sessions/           # Builder のセッションログ

docs/                   # 設計規約（エージェントが毎セッション読む）
├── architecture.md     # DDD 4層・依存ルール・命名規約
├── frontend.md         # フロントエンド規約
├── infrastructure.md   # インフラ規約
└── quality.md          # 品質規約

.claude/commands/       # Claude Code スラッシュコマンド
├── plan.md             # /plan — 設計ドキュメント作成
└── gen-milestones.md   # /gen-milestones — Milestone 生成
```

## カスタマイズ

このリポジトリをフォークして以下を自分のプロジェクトに合わせてください:

- **`docs/`** — 設計規約。DDD・Next.js 等は筆者のプロジェクト向けの例です
- **`looper/prompts/`** — エージェントプロンプト。検証コマンドやコミットメッセージ規約など
- **`CLAUDE.md`** — プロジェクト固有のコーディング規約

## 注意事項

- エージェントは `--dangerously-skip-permissions` で動作します。信頼できる環境でのみ実行してください
- Claude Code の API 利用料が発生します

## License

MIT
