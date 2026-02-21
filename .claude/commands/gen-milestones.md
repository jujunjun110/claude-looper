あなたはプロジェクトの Milestone 設計者です。

## やること

ユーザーから与えられたドキュメントを読み、プロジェクトの Milestone 一覧を設計する。
各 Milestone のゴール（何が動く状態になるか）を定義する。
Task の細分化は Milestone 着手時に計画セッションが行うため、ここでは Milestone レベルの設計のみ行う。

### 前提: 設計ドキュメント

このコマンドの引数としてドキュメントのパスが与えられることを期待する。
引数がない場合、または指定されたファイルが存在しない場合は、以下のメッセージを返して終了する:

> 設計ドキュメントのパスを指定してください。
> ドキュメントがまだない場合は `/plan` コマンドで作成し、そのパスを引数に指定してください。
>
> 例: `/gen-milestones docs/application-overview.md`

### 手順

1. 引数で指定されたドキュメントを読む
2. docs/ 配下に関連ドキュメントがあれば読む
3. CLAUDE.md を読む
4. 既存コードがあれば Glob/Grep で現状を把握する
5. 既存の looper/milestones.json があればアーカイブする（後述）
6. Milestone を設計する
7. looper/milestones.json を出力する
8. git add looper/milestones*.json && git commit -m "chore: generate milestones"

## アーカイブ

looper/milestones.json が既に存在する場合、新しい milestones.json を生成する前にリネームしてアーカイブする:

```bash
mv looper/milestones.json "looper/milestones.$(date +%Y%m%d_%H%M%S).json"
```

これにより過去の Milestone 履歴が保持される。アーカイブ済みファイルは run.sh からは参照されない。

## 出力フォーマット

唯一の成果物は looper/milestones.json。

```json
[
  {
    "milestone": 1,
    "goal": "何が動く状態になるか（1文、具体的に）",
    "verification": "pnpm lint && pnpm typecheck && pnpm build",
    "done": false,
    "tasks": []
  },
  {
    "milestone": 2,
    "goal": "...",
    "verification": "pnpm test && pnpm lint && pnpm typecheck",
    "done": false,
    "tasks": []
  }
]
```

| フィールド | 型 | 説明 |
|-----------|------|------|
| milestone | number | Milestone 番号（1 始まり、昇順） |
| goal | string | この Milestone が完了したとき何が動く状態か（1文、具体的に） |
| verification | string | Milestone 完了時の通過条件コマンド |
| done | boolean | 常に false（ループが更新する） |
| tasks | array | 常に空配列（Milestone 着手時に計画セッションが生成する） |

## Milestone の設計方針

### 依存関係で Milestone を分ける

Milestone 間は逐次実行。Milestone 内の Task は並列実行される。
Milestone の境界は「次の Milestone が前の Milestone の成果物を import する」ところ。

### 契約先行パターン

1. **基盤 Milestone**: プロジェクト構成、ツールチェーン
2. **契約 Milestone**: interface、型定義、API shape
3. **実装 Milestone**: 契約に基づく並列実装（application + infrastructure）
4. **統合 Milestone**: presentation + frontend + CI

### goal の書き方

- 悪い例: "DDD レイヤー構造で構成され、Gateway interface が定義される"
- 良い例: "domain 層が完成する: TextSplitter でテキストを Sentence[] に分割し、CheckResultAggregator で結果を統合でき、unit test が通る"

goal は具体的に「何が動くか」「何ができるか」を書く。計画セッションがこの goal を見て Task を分解する。

### verification

- 既存のプロジェクトコマンドだけ使う: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`
- 外部 API を叩かない（ループが毎回機械的に実行するため）
- **UI の変更を伴う Milestone では Playwright で実際の UI の動作確認を行う**
  - URL の直接アクセス（`page.goto()` 等）は禁止。UI 上のクリック操作によって画面遷移すること
  - 初期ページ（トップページ等）へのアクセスのみ `page.goto()` を許可する

### 目標

- 全体で 4-6 Milestone
- Milestone 番号は 1 から連番
- tasks は全て空配列（計画セッションが Milestone 着手時に W1-W5 の Task を生成する）
