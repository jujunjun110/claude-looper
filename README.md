# claude-looper

Claude Code で「計画→実装→検証」の自律開発ループを回すサンプル実装。

ブログ記事の補足資料として公開しています。汎用ライブラリではありません。自分のプロジェクトに合わせて自由に改変してください。

## 何をするものか

`looper/run.sh` を実行すると、3 つの Claude Code エージェントが協調して開発を進めます。

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Planner  │────▶│ Builder  │────▶│ Verifier │
│ タスク設計 │     │ 並列実装  │     │ マージ検証 │
└──────────┘     └──────────┘     └──────────┘
                       │                │
                       │          失敗時 fix タスク生成
                       │                │
                       ◀────────────────┘
```

- **Planner**: Milestone のゴールをタスクに分解（コードは書かない）
- **Builder**: 1 タスク = 1 セッション。Git worktree で隔離して並列実行
- **Verifier**: ブランチをマージして品質検証。失敗したら fix タスクを追加してリトライ

スクリプト（bash）は worktree の作成とプロセス起動だけを担当し、判断は全てエージェントが行います。

## 前提

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
- jq
- Git

## 使い方

```bash
# 1. milestones.json にゴールを定義
# 2. 実行
bash looper/run.sh

# ドライラン（実行計画の確認のみ）
bash looper/run.sh --dry-run

# 別ターミナルで監視
watch -n3 bash looper/monitor.sh
```

## ファイル構成

```
looper/
├── run.sh              # オーケストレーション
├── monitor.sh          # リアルタイム監視
├── milestones.json     # Milestone / Task の定義と進捗
├── prompts/            # エージェントプロンプト
│   ├── planner.md
│   ├── builder.md
│   └── verifier.md
├── docs/               # 技術スタック共通の設計規約
└── sessions/           # Builder のセッションログ

.claude/
├── settings.json       # Biome 自動フォーマット hook
└── commands/
    └── gen-milestones.md  # /gen-milestones スラッシュコマンド
```

詳細は [looper/README.md](looper/README.md) を参照。

## 仕組みの概要

### Milestone × Wave

- **Milestone**: 機能の大きな塊。直列に進む（M1 完了 → M2 開始）
- **Wave**: Milestone 内の依存順序。同 Wave のタスクは並列実行される

```
Milestone 1
  Wave 1: interface / 型定義（契約）
  Wave 2: 独立した実装を並列実行
  Wave 3: 統合・テスト
Milestone 2
  ...
```

### 並列化

同 Wave の Builder タスクは別々の Git worktree で同時に動きます。ファイルシステムレベルで隔離されるため、コンフリクトが起きません。

### 自己修復

Verifier の検証が失敗すると fix タスクが自動生成され、次のラウンドで Builder がリトライします。

## 注意事項

- これはサンプルコードです。プロダクション利用を想定したものではありません
- `looper/docs/` 内の設計規約（DDD、Next.js 等）は筆者のプロジェクト向けの例です。自分のスタックに合わせて書き換えてください
- エージェントは `--dangerously-skip-permissions` で動作します。信頼できる環境でのみ実行してください
- Claude Code の API 利用料が発生します

## License

MIT
