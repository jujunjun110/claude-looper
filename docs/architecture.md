# Backend Architecture Rules

pnpm workspace + Next.js App Router における DDD バックエンド設計規約。
`apps/{app}/src/backend/` 配下に適用する。

---

## DDD 4層構造

| 層 | ディレクトリ | 責務 |
|---|---|---|
| presentation | `composition/` `loaders/` `actions/` | Next.js Server Components / Server Actions との接続 |
| application | `usecases/` | ユースケースオーケストレーション。プロンプト生成・レスポンスパース含む |
| domain | `models/` `services/` `gateways/` | ビジネスルール。外部依存なし |
| infrastructure | `ai/` `repositories/` | Gateway / Repository 実装。外部サービス接続 |

---

## 依存方向（厳守）

`presentation → application → domain ← infrastructure`

- **domain は最内層。** 他層への依存禁止
- **application → domain のみ。** infrastructure への直接依存禁止（Gateway interface 経由）
- **infrastructure → domain/gateways。** interface を implements する
- **presentation/loaders, actions → application + presentation/composition のみ。** domain・infrastructure 直接参照禁止
- **presentation/composition → 全層。** UseCase と infrastructure 実装を組み立てる唯一の場所（後述）
- **フロントエンド** (`app/`, `components/`, `hooks/`, `lib/`) **→ backend/presentation/ のみ**

---

## presentation 層: composition / loaders / actions

Next.js と DDD の唯一の接続点。**API Route は原則使用しない。**

| 種別 | 責務 | 呼び出し元 |
|---|---|---|
| composition | UseCase + infrastructure 実装の組み立て（Composition Root） | loader, action |
| loader | データ取得（読み取り専用） | Server Component (`page.tsx`) |
| action | 副作用（CUD, SSE ストリーム） | Server Actions (`'use server'`) |

- **page.tsx は loader を呼んで props を渡すだけ。** ロジック禁止
- **loader / action は composition から UseCase を取得して呼ぶ。** infrastructure の直接 import 禁止
- **composition は全層を参照してよい唯一の場所。** UseCase に infrastructure 実装を注入し、ファクトリ関数としてエクスポートする
- API Route は外部 Webhook 受信等の例外のみ許可

---

## ドメインモデル設計

**Rich Domain Model を徹底する。Anemic Domain Model 禁止。**

- 値の生成・検証・変換はモデル自身のファクトリメソッド / インスタンスメソッドで行う
- ドメイン不変条件はファクトリメソッド / コンストラクタで強制する。不正な状態のオブジェクト生成を許さない
- domain service に置くのは「複数モデルの協調」のみ。単一モデルで完結するロジックをサービスに書かない

| ロジックの性質 | 配置先 |
|---|---|
| 単一モデルの生成・検証・変換 | model 自身 |
| 複数モデルの協調・オーケストレーション | domain service |
| 外部サービス利用（LLM, DB） | application (UseCase → Gateway 経由) |

---

## サービス実装規約

**全サービス（domain service, UseCase）はクラスベース + コンストラクタ DI。関数エクスポートによるサービス実装は禁止。**

- コンストラクタの `private readonly` パラメータで Gateway 等の依存を受け取る
- ビジネスロジックは `execute()` 等の public メソッドで公開する
- ヘルパーは private メソッドに閉じる。クラス外への export 禁止

例外: 型定義 (`interface`, `type`) およびユーティリティ型 (`Result<T,E>` 等) は関数 / 定数エクスポート可。

---

## Gateway / Repository パターン

| 種類 | interface 配置 | 実装配置 |
|---|---|---|
| Gateway (AI) | `domain/gateways/` | `infrastructure/ai/` |
| Repository | `domain/gateways/` | `infrastructure/repositories/` |

### Repository

- interface の引数・戻り値は **ドメインモデル型のみ。** ORM 生成型や plain type alias を interface に出さない
- ORM 型 ↔ ドメインモデル変換は infrastructure 層（実装側）が担当する

### AI Gateway

- **汎用 interface として定義する。** ドメイン固有メソッド（`checkFacts()`, `analyzeRisk()` 等）に分割しない
- `generate()`, `generateWithWebSearch()` 等の汎用メソッドで構成する
- **プロンプト生成・レスポンスパースは application 層の責務。** infrastructure 層は API 呼び出し・リトライ・タイムアウトのみ担当
- LLM プロバイダー差し替え時は Gateway 実装の差し替えだけで完了する設計にする

---

## エラーハンドリング

| 層 | 方式 |
|---|---|
| domain | `Result<T, E>` 型を返す (`{ success: true; value: T } \| { success: false; error: E }`) |
| application | throw（Result の失敗を例外に変換） |
| infrastructure | throw |
| presentation | catch → エラーレスポンス or Error Boundary |

---

## ファイル命名規約

kebab-case + ドット区切りレイヤーサフィックス。ハイフンでつなげない。

| 種別 | サフィックス |
|---|---|
| UseCase | `.usecase.ts` |
| Domain Model | `.model.ts` |
| Domain Service | `.service.ts` |
| Gateway Interface | `.gateway.ts` |
| Repository Interface | `.repository.ts` |
| AI Gateway 実装 | `.ai-gateway.ts` |
| Repository 実装 | `.repository.ts` |
| Composition | `.composition.ts` |
| Loader | `.loader.ts` |
| Action | `.action.ts` |
| テスト | `.test.ts` |

---

## 禁止事項

- `index.ts` によるバレルエクスポート
- 関数ベースの domain service
- Anemic Domain Model（データ構造だけのモデル）
- application → infrastructure の直接依存
- presentation/loaders, actions → domain・infrastructure の直接依存（composition 経由で解決）
- infrastructure 層にビジネスロジック（プロンプト生成含む）
- page.tsx にデータ取得・ビジネスロジック
