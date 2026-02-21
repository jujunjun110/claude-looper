# Quality Check Rules

vitest + TypeScript + dependency-cruiser によるコード品質チェック規約。

---

## Quality Check 一覧

| チェック | ツール | 対象 | コマンド |
|---|---|---|---|
| Unit テスト | vitest | domain, application | `pnpm --filter backend test:unit` |
| Integration テスト | vitest | infrastructure, application (一部) | `pnpm --filter backend test:integration` |
| 型チェック | `tsc --noEmit` | 全ソース | `pnpm typecheck` |
| 依存方向チェック | dependency-cruiser | 全ソース | `pnpm depcruise` |

CI では `lint` → `typecheck` → `depcruise` → `test` の順で実行する。

### verify コマンド

| コマンド | 内容 | 用途 |
|---|---|---|
| `pnpm verify` | lint → prisma generate → typecheck → build → unit test | Builder のセルフチェック（worktree、DB 不要） |
| `pnpm verify:full` | `pnpm verify` + E2E テスト | Verifier の完全検証（本体ブランチ、ローカル Supabase 必要） |

---

## TypeCheck

- `tsc --noEmit` で型エラーがないことを確認する
- `any` の使用は原則禁止。型推論で解決できない場合のみ許容
- CI で必ず実行。型エラーがある PR はマージ不可

---

## dependency-cruiser

`architecture.md` の依存方向ルールを自動検証する。

| ルール | 内容 |
|---|---|
| domain → 外部層 | 禁止 |
| application → infrastructure | 禁止（Gateway interface 経由のみ） |
| presentation/loaders, actions → domain | 禁止 |
| presentation/loaders, actions → infrastructure | 禁止（composition 経由で解決） |
| presentation/composition → 全層 | **許可**（Composition Root として全層を参照可） |
| frontend → backend/presentation 以外 | 禁止 |

違反があれば CI で失敗させる。

---

## テスト方針

### ディレクトリ構造

```
apps/backend/test/
├── unit/
│   └── contexts/
│       ├── clip-video/
│       │   ├── application/usecases/    # UseCase テスト（モック）
│       │   └── domain/
│       │       ├── models/              # Model テスト
│       │       └── services/            # Service テスト
│       └── shared/
│           └── infrastructure/clients/  # モック可能な Client テスト
│
├── integration/
│   └── contexts/
│       ├── clip-video/
│       │   ├── application/usecases/    # 複数 Client を組み合わせたテスト
│       │   └── infrastructure/
│       │       └── repositories/        # DB 接続テスト
│       └── shared/
│           └── infrastructure/clients/  # 外部サービス接続テスト
│
└── fixtures/                            # テスト用データ
```

---

### Unit テスト

対象: domain（全部）、application（全部）

- 外部依存なしで実行可能
- Gateway はモックする
- Domain 層: モデルのファクトリメソッド・バリデーション・ビジネスロジックを検証
- Application 層: UseCase の入出力と Gateway 呼び出しを検証

---

### Integration テスト

対象: infrastructure（全部）、application（必要に応じて）

実際の外部サービス・DB に接続してテスト。

#### 実行条件

| 対象 | 環境変数 | スキップ条件 |
|---|---|---|
| 外部サービス Client | `INTEGRATION_TEST=true` | 未設定時スキップ |
| Repository (DB) | `DATABASE_URL` | 未設定時スキップ |

- 外部サービス Client: `describe.skipIf(!runIntegrationTests)` で環境変数未設定時にスキップ
- Repository: 実際の DB に接続。`beforeEach` でテストデータをクリーンアップ
- Application 層 (統合): 複数の実 Client を組み合わせてテスト。必要な環境変数がすべて揃っている場合のみ実行

---

### Fixtures

テスト用の静的データを `test/fixtures/` に配置する。

```
test/fixtures/
├── sample.mp4          # 動画処理テスト用
├── sample.wav          # 音声処理テスト用
└── output/             # テスト出力先（gitignore）
```

| ルール | 理由 |
|---|---|
| 小さいファイルを使用 | CI の速度を維持 |
| `output/` は gitignore | 生成物をリポジトリに含めない |
| 実データは使用しない | 著作権・プライバシー |

---

## 実行方法

### ローカル開発

```sh
# Unit テストのみ（常時実行可能）
pnpm --filter backend test:unit

# Integration テスト（DB 接続のみ）
DATABASE_URL=postgresql://... pnpm --filter backend test:integration

# Integration テスト（外部サービス含む）
INTEGRATION_TEST=true \
DATABASE_URL=postgresql://... \
GOOGLE_APPLICATION_CREDENTIALS_JSON='...' \
OPENAI_API_KEY=sk-... \
pnpm --filter backend test:integration
```

### CI

```yaml
# Unit テスト - 常に実行
- run: pnpm --filter backend test:unit

# Integration テスト - secrets 設定時のみ
- run: pnpm --filter backend test:integration
  env:
    INTEGRATION_TEST: true
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```
