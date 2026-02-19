# Looper

Claude Code エージェントによる自律的並列開発エンジン。

pnpm workspace + Next.js App Router + Vercel + DDD を前提とし、3 エージェント分業と Milestone × Wave 構造で、人間の介入なしにアプリケーションを構築する。

---

## 設計原則

### 判断は全て LLM。スクリプトはプロセス起動のみ。

`run.sh` の責務は Git worktree の作成・プロセスの起動・待機だけ。タスク設計・実装・マージ判断・エラー修復の全意思決定をエージェントが行う。

### 3 エージェント分業

| エージェント | 責務 | 制約 |
|---|---|---|
| **Planner** | Milestone のゴールからタスクを Wave 構造で設計 | コードは一切書かない |
| **Builder** | 1 タスク = 1 セッションで実装。worktree 内で隔離実行 | 割り当てタスクのみ。他タスクに手を出さない |
| **Verifier** | Builder ブランチをマージし品質検証。失敗時は fix タスクを生成 | 大規模修正はしない。修正は Builder に委任 |

### Milestone × Wave による依存制御

- **Milestone**: 機能の大きな塊。直列実行（Milestone N 完了 → Milestone N+1 開始）
- **Wave**: Milestone 内の依存順序。同 Wave のタスクは並列実行可能
- **契約先行パターン**: W1 で interface / 型定義 → W2 で並列実装 → W3 で統合・テスト

### Git worktree による物理的並列化

同 Wave の Builder タスクは別 worktree で同時実行される。ファイルシステムレベルでコンフリクトを回避し、`node_modules` は symlink で共有する。

### 自己修復ループ

Verifier が品質検証に失敗すると fix タスクを `milestones.json` に追加し、次ラウンドで Builder がリトライする。人間の介入なしにループが回り続ける。

---

## ファイル構成

```
looper/
├── run.sh                         # Milestone ループのオーケストレーション
├── monitor.sh                     # Builder セッションのリアルタイム監視
├── docs/                          # フレームワーク共通の設計規約
│   ├── architecture.md            #   DDD 4層 + 依存ルール + 命名規約
│   ├── frontend.md                #   Next.js App Router + UI 規約
│   └── infrastructure.md          #   pnpm + Vercel + Supabase 規約
├── prompts/                       # エージェントプロンプト
│   ├── planner.md
│   ├── builder.md
│   └── verifier.md
├── milestones.json                # Milestone / Task の定義と進捗
└── sessions/                      # Builder セッションの作業ログ
```

### 汎用（①）とアプリ固有（②）の分離

| ① looper/ 内（汎用） | ② プロジェクトルート（アプリ固有） |
|---|---|
| `docs/` — 技術スタック共通の設計規約 | `CLAUDE.md` — プロジェクト固有の規約 |
| `prompts/` — エージェントの行動規範 | `docs/` — ドメイン固有の設計ドキュメント |
| `run.sh` / `monitor.sh` — 実行基盤 | `milestones.json` の中身（Milestone / Goal / Task） |

エージェントは両方を読む。`looper/docs/` がフレームワークのルール、プロジェクトルートの `CLAUDE.md` + `docs/` がアプリ固有のコンテキストを提供する。

---

## 前提技術スタック

| 技術 | 用途 |
|---|---|
| pnpm workspace | monorepo 管理 |
| Next.js App Router | フロントエンド + サーバーサイド |
| Vercel | デプロイ + Preview 環境 |
| Supabase | PostgreSQL + pgvector + Auth |
| Prisma | スキーマ管理 |
| Biome | lint / format |
| shadcn/ui + Tailwind CSS | UI |
| Vitest | テスト |
| Claude Code CLI | エージェント実行 |

---

## 使い方

### 1. プロジェクトの準備

1. `CLAUDE.md` にプロジェクト固有の規約を記述
2. `docs/` にドメイン固有の設計ドキュメントを配置
3. `milestones.json` に Milestone とゴールを定義（tasks は Planner が自動生成）

### 2. 実行

```bash
bash looper/run.sh              # 実行
bash looper/run.sh --dry-run    # 実行計画の確認のみ
```

### 3. 監視

```bash
watch -n3 bash looper/monitor.sh
```

---

## milestones.json スキーマ

```json
[
  {
    "milestone": 1,
    "goal": "検証可能なゴール記述",
    "verification": "ゴール達成を検証するコマンド",
    "done": false,
    "tasks": []
  }
]
```

tasks は Planner が自動生成する:

```json
{"id": "kebab-case-id", "description": "具体的な実装内容", "wave": 1, "done": false}
```

---

## 環境変数

| 変数 | デフォルト | 説明 |
|---|---|---|
| `RALPH_WORKTREE_BASE` | `/tmp/ralph-worktrees` | worktree 作成先 |
| `RALPH_LOG_DIR` | `/tmp/ralph-logs` | ログ出力先 |
| `MAX_PARALLEL` | `5` | 同時実行 Builder 数上限 |
| `MAX_ROUNDS` | `50` | Wave ラウンド上限 |
| `RALPH_SESSION_TIMEOUT` | `1800` | 各エージェントセッションのタイムアウト（秒） |

---

## プロンプトのカスタマイズ

`prompts/` 配下のテンプレートを編集する。プレースホルダー:

| プレースホルダー | 展開先 |
|---|---|
| `__MILESTONE__` | 現在の Milestone 番号 |
| `__GOAL__` | Milestone のゴール |
| `__TASK_ID__` | タスク ID |
| `__TASK_DESC__` | タスク description |
| `__BRANCHES__` | マージ対象ブランチ一覧 |
