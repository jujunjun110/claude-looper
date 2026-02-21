# Content Reviewer 全体設計

## 目的

広報チームが、議員のSNS発信コンテンツ（YouTube, X, note等）を全件目視レビューしている負荷を解消するため。

LLMを活用した自動チェックシステムにより、ファクトチェック・表現ルール適合・炎上リスク判定等の検証を自動化し、広報チームはAIが指摘した箇所のみを確認すればよい状態にする。

---

## システム概要

### 入力経路

| 経路 | 概要 |
|---|---|
| Slack | `@sns-checker` メンション → 自動チェック → スレッドに結果返信 |
| Web | テキスト入力 → チェック実行 → 結果表示 |

### チェック観点（5種）

| チェック種別 | 概要 | 主な手段 |
|---|---|---|
| ファクトチェック | 一般的な事実との整合性 | Claude + Web検索 |
| ナレッジ整合性 | note記事・マニフェスト等との整合性 | Claude + pgvector RAG |
| 表現ルール適合 | 登録済みNG表現の検出 | Claude + DBルール参照 |
| 炎上リスク判定 | 誰かを傷付ける・貶める表現の検出 | Claude |
| 文章クオリティ | 誤字脱字・同一動詞の繰り返し等 | Claude |

### 処理フロー

```
入力テキスト（最大30,000字）
    ↓
LLMによる段落分割（セマンティック分割）
    ↓
各セグメントに対して5種のチェックを並列実行
    ↓
結果集約 → 保存 → 表示/通知
```

---

## Bounded Context

| Context | 責務 |
|---|---|
| `content-check` | コンテンツチェックの実行・結果管理 |
| `expression-rule` | 表現ルールのCRUD管理 |
| `knowledge` | ナレッジ記事の管理・Embedding生成・note記事取込 |
| `auth` | Google OAuth認証・ユーザー管理 |
| `shared` | 共有値オブジェクト・共通Gateway interface・技術基盤 |

---

## ページ構成

| パス | 機能 | 認証 |
|---|---|---|
| `/login` | Googleログイン | 不要 |
| `/` | ダッシュボード（チェック履歴一覧・フィルタ） | 必要 |
| `/checks/new` | コンテンツチェック実行 | 必要 |
| `/checks/[id]` | チェック結果詳細 | 必要 |
| `/rules` | 表現ルール管理（一覧・登録・編集・削除） | 必要 |
| `/knowledge` | ナレッジ記事管理（一覧・登録・編集） | 必要 |
| `/knowledge/import` | note記事自動取込 | 必要 |
| `/api/slack/events` | Slack Webhook受信（API Route） | Slack署名検証 |

開発環境（`NODE_ENV=development`）では認証スキップ可能。

---

## データベース設計

### ER図

```
users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── name (TEXT)
├── avatar_url (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

content_checks
├── id (UUID, PK)
├── user_id (UUID, FK → users.id, nullable)  -- Slack経由の場合はnull
├── source (TEXT)  -- "web" | "slack"
├── original_text (TEXT)  -- 原文（最大30,000字）
├── status (TEXT)  -- "pending" | "processing" | "completed" | "failed"
├── slack_channel_id (TEXT, nullable)
├── slack_thread_ts (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

content_segments
├── id (UUID, PK)
├── content_check_id (UUID, FK → content_checks.id)
├── segment_index (INT)  -- セグメント順序
├── text (TEXT)  -- 分割されたテキスト
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

check_results
├── id (UUID, PK)
├── content_segment_id (UUID, FK → content_segments.id)
├── check_type (TEXT)  -- "fact_check" | "knowledge_consistency" | "expression_rule" | "risk_assessment" | "quality"
├── severity (TEXT)  -- "info" | "warning" | "error"
├── message (TEXT)  -- 指摘内容
├── suggestion (TEXT, nullable)  -- 修正提案
├── metadata (JSONB, nullable)  -- チェック固有の付加情報
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

expression_rules
├── id (UUID, PK)
├── ng_expression (TEXT)  -- NG表現
├── recommended_expression (TEXT)  -- 推奨表現
├── description (TEXT, nullable)  -- 補足説明
├── is_active (BOOLEAN, DEFAULT true)
├── created_by (UUID, FK → users.id)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

knowledge_articles
├── id (UUID, PK)
├── title (TEXT)
├── content (TEXT)  -- 記事本文
├── source_url (TEXT, nullable)  -- note等の元URL
├── source_type (TEXT)  -- "manual" | "note"
├── created_by (UUID, FK → users.id)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

knowledge_embeddings
├── id (UUID, PK)
├── knowledge_article_id (UUID, FK → knowledge_articles.id)
├── chunk_index (INT)  -- チャンク順序
├── chunk_text (TEXT)  -- 分割テキスト
├── embedding (VECTOR(1536))  -- pgvector
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### テーブル間リレーション

- `content_checks` 1:N `content_segments`（1回のチェックに複数セグメント）
- `content_segments` 1:N `check_results`（1セグメントに最大5種のチェック結果）
- `knowledge_articles` 1:N `knowledge_embeddings`（1記事を複数チャンクに分割しEmbedding化）

---

## ドメインモデル

### content-check Context

#### ContentCheck

チェック実行の親エンティティ。

- ファクトリ: `create(source, originalText, userId?)` — テキストのバリデーション（空文字・30,000字上限）
- 状態遷移: `pending` → `processing` → `completed` / `failed`
- 集計: チェック結果のサマリー生成（error/warning/info件数）

#### ContentSegment

段落分割されたセグメント。

- ファクトリ: `create(contentCheckId, segmentIndex, text)` — インデックスの正値バリデーション

#### CheckResult

各チェックの結果。

- ファクトリ: `create(segmentId, checkType, severity, message, suggestion?)` — checkType/severityの値バリデーション
- 値オブジェクト: `CheckType` (5種の列挙)、`Severity` (3段階)

#### ContentReviewService（Domain Service）

複数のCheckResultを集約し、全体の判定サマリーを生成する。

### expression-rule Context

#### ExpressionRule

NG表現→推奨表現のルール。

- ファクトリ: `create(ngExpression, recommendedExpression, description?, createdBy)` — NG表現の空文字チェック、推奨表現の空文字チェック
- 操作: `update(ngExpression, recommendedExpression, description?)`, `deactivate()`, `activate()`

### knowledge Context

#### KnowledgeArticle

ナレッジ記事。

- ファクトリ: `create(title, content, sourceType, sourceUrl?, createdBy)` — タイトル・本文の空文字チェック
- 操作: `update(title, content)`

#### KnowledgeEmbedding

記事のベクトル埋め込みチャンク。

- ファクトリ: `create(articleId, chunkIndex, chunkText, embedding)` — embeddingの次元数バリデーション

---

## Gateway / Repository Interface

### shared Context

#### AIGateway（共通）

```
interface AIGateway {
  generate(prompt: string, options?: GenerateOptions): Promise<string>
  generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string>
  generateWithWebSearch(prompt: string, options?: GenerateOptions): Promise<string>
}
```

#### EmbeddingGateway（共通）

```
interface EmbeddingGateway {
  generateEmbedding(text: string): Promise<number[]>
}
```

### content-check Context

#### ContentCheckRepository

- `save(contentCheck: ContentCheck): Promise<void>`
- `findById(id: ContentCheckId): Promise<ContentCheck | null>`
- `findAll(filter: ContentCheckFilter): Promise<ContentCheck[]>`

#### ContentSegmentRepository

- `saveMany(segments: ContentSegment[]): Promise<void>`
- `findByContentCheckId(contentCheckId: ContentCheckId): Promise<ContentSegment[]>`

#### CheckResultRepository

- `saveMany(results: CheckResult[]): Promise<void>`
- `findBySegmentId(segmentId: ContentSegmentId): Promise<CheckResult[]>`
- `findByContentCheckId(contentCheckId: ContentCheckId): Promise<CheckResult[]>`

#### SlackGateway

- `postMessage(channelId: string, threadTs: string, text: string): Promise<void>`

#### ExpressionRuleProvider

表現ルールを content-check Context 内から参照するための Gateway interface。Context 間の直接 import を回避するため、content-check 側に定義する。

- `findActiveRules(): Promise<{ ngExpression: string; recommendedExpression: string }[]>`

#### WebSearchGateway

- `search(query: string): Promise<SearchResult[]>`

### expression-rule Context

#### ExpressionRuleRepository

- `save(rule: ExpressionRule): Promise<void>`
- `findById(id: ExpressionRuleId): Promise<ExpressionRule | null>`
- `findAll(): Promise<ExpressionRule[]>`
- `findActive(): Promise<ExpressionRule[]>`
- `delete(id: ExpressionRuleId): Promise<void>`

### knowledge Context

#### KnowledgeArticleRepository

- `save(article: KnowledgeArticle): Promise<void>`
- `findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null>`
- `findAll(): Promise<KnowledgeArticle[]>`
- `delete(id: KnowledgeArticleId): Promise<void>`

#### KnowledgeEmbeddingRepository

- `saveMany(embeddings: KnowledgeEmbedding[]): Promise<void>`
- `deleteByArticleId(articleId: KnowledgeArticleId): Promise<void>`
- `searchSimilar(embedding: number[], limit: number): Promise<KnowledgeEmbedding[]>`

#### NoteScraperGateway

- `fetchArticleList(accountName: string): Promise<NoteArticleSummary[]>`
- `fetchArticleContent(url: string): Promise<{ title: string; content: string }>`

---

## UseCase一覧

### content-check Context

| UseCase | 概要 |
|---|---|
| `ExecuteContentCheckUseCase` | テキストの段落分割 → 5種チェック並列実行 → 結果保存。SSEストリームでの進捗通知対応 |
| `GetContentCheckDetailUseCase` | チェック結果詳細の取得（セグメント・チェック結果含む） |
| `ListContentChecksUseCase` | チェック履歴一覧の取得（フィルタ: source, status, 日時範囲） |

#### ExecuteContentCheckUseCase 処理フロー

1. ContentCheck エンティティ生成（status: pending）
2. AIGateway で段落分割（原文をLLMに渡し、セマンティックに分割）
3. ContentSegment エンティティ群を生成・保存
4. 各セグメントに対して5種のチェックを `Promise.all` で並列実行:
   - **ファクトチェック**: AIGateway.generateWithWebSearch でセグメント内の事実主張を検証
   - **ナレッジ整合性**: EmbeddingGateway でセグメントをベクトル化 → KnowledgeEmbeddingRepository.searchSimilar で関連ナレッジ取得 → AIGateway.generate で整合性判定
   - **表現ルール適合**: ExpressionRuleProvider（content-check Context 内の Gateway interface）でアクティブルール一覧取得 → AIGateway.generate でルール違反検出。infrastructure 層で `expression_rules` テーブルを参照する実装を提供（Context間の直接import を回避）
   - **炎上リスク判定**: AIGateway.generate で問題表現を検出
   - **文章クオリティ**: AIGateway.generate で誤字脱字・文体チェック
5. CheckResult エンティティ群を生成・保存
6. ContentCheck のステータスを completed に更新
7. 進捗は `onProgress` コールバックでSSEに変換して通知

### expression-rule Context

| UseCase | 概要 |
|---|---|
| `CreateExpressionRuleUseCase` | 表現ルールの新規登録 |
| `UpdateExpressionRuleUseCase` | 表現ルールの編集 |
| `DeleteExpressionRuleUseCase` | 表現ルールの削除 |
| `ListExpressionRulesUseCase` | 表現ルール一覧の取得 |

### knowledge Context

| UseCase | 概要 |
|---|---|
| `CreateKnowledgeArticleUseCase` | ナレッジ記事の手動登録 + Embedding生成・保存 |
| `UpdateKnowledgeArticleUseCase` | ナレッジ記事の編集 + Embedding再生成 |
| `ListKnowledgeArticlesUseCase` | ナレッジ記事一覧の取得 |
| `ImportNoteArticlesUseCase` | note記事のURL一覧取得 + 選択記事のDB保存 + Embedding生成 |

---

## Slack連携

### エントリポイント

`/api/slack/events`（API Route）で Slack Events API の Webhook を受信する。

### 処理フロー

1. Slack署名検証（`x-slack-signature` ヘッダー）
2. `url_verification` チャレンジへの応答
3. `app_mention` イベント検出
4. メンション本文からチェック対象テキストを抽出
5. 即座にHTTP 200を返す（Slackの3秒タイムアウト対策）
6. `waitUntil` でバックグラウンドにて `ExecuteContentCheckUseCase` を実行
7. 完了後、`SlackGateway.postMessage` でスレッドに結果サマリーと `/checks/[id]` のパーマリンクを返信

---

## note記事取込

### 処理フロー

1. ユーザーが `/knowledge/import` でnoteアカウント名を入力
2. `NoteScraperGateway.fetchArticleList` でRSSフィード等から記事URL一覧を取得
3. 記事一覧をUI上に表示
4. ユーザーが取り込みたい記事を選択し「保存」ボタンを押下
5. 選択した記事ごとに `NoteScraperGateway.fetchArticleContent` で本文取得
6. `CreateKnowledgeArticleUseCase` で DB保存 + Embedding生成

---

## SSEストリーム設計

コンテンツチェック実行時、進捗をリアルタイムでクライアントに通知する。

### イベント種別

| イベント | データ | タイミング |
|---|---|---|
| `segments_created` | `{ total: number }` | 段落分割完了時 |
| `check_started` | `{ segmentIndex: number, checkType: string }` | 各チェック開始時 |
| `check_completed` | `{ segmentIndex: number, checkType: string, resultCount: number }` | 各チェック完了時 |
| `completed` | `{ contentCheckId: string, summary: { error: number, warning: number, info: number } }` | 全チェック完了時 |
| `error` | `{ message: string }` | エラー発生時 |

### 実装方式

- action 層で `ReadableStream` を生成し、SSEフォーマットで進捗イベントを送出
- UseCase の `onProgress` コールバックでイベントを受け取り、ストリームに書き込む
- Client Component 側で `fetch` + `ReadableStream` の reader で consume

---

## 認証設計

### Google OAuth（Supabase Auth）

- Supabase Auth の Google OAuth プロバイダーを利用
- Next.js middleware で未認証時に `/login` へリダイレクト
- ログイン成功時、Supabase の `auth.users` → アプリケーションの `users` テーブルに同期
- 許可ドメインの制限はSupabase側の設定で管理

### 開発環境スキップ

- `NODE_ENV=development` 時、middleware で認証チェックをスキップ
- 固定のダミーユーザーIDでリクエストを処理

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js App Router, shadcn/ui, Tailwind CSS |
| バックエンド | Next.js Server Components / Server Actions, DDD 4層 |
| データベース | Supabase PostgreSQL + pgvector |
| ORM | Prisma |
| LLM | Claude API（Anthropic SDK） |
| Embedding | OpenAI Embeddings API（1536次元） |
| 認証 | Supabase Auth（Google OAuth） |
| デプロイ | Vercel |
| Slack連携 | Slack Events API + Slack Web API |
| CI/CD | GitHub Actions（lint → typecheck → depcruise → test） |
| パッケージ管理 | pnpm workspace |

---

## 環境変数

`ANTHROPIC_API_KEY` と `OPENAI_API_KEY` はローカルの `.env` に存在するので、そのまま利用すること。新たに取得・設定する必要はない。

---

## ディレクトリ構成（主要部分）

```
apps/content-reviewer/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # ダッシュボード
│   │   ├── login/page.tsx
│   │   ├── checks/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── rules/page.tsx
│   │   ├── knowledge/
│   │   │   ├── page.tsx
│   │   │   └── import/page.tsx
│   │   └── api/
│   │       └── slack/
│   │           └── events/route.ts
│   ├── components/                   # React Components
│   │   └── ui/                       # shadcn/ui
│   ├── hooks/
│   ├── lib/
│   └── backend/
│       └── contexts/
│           ├── content-check/
│           │   ├── presentation/
│           │   │   ├── composition/
│           │   │   ├── loaders/
│           │   │   └── actions/
│           │   ├── application/usecases/
│           │   ├── domain/
│           │   │   ├── models/
│           │   │   ├── services/
│           │   │   └── gateways/
│           │   └── infrastructure/
│           │       ├── ai/
│           │       └── repositories/
│           ├── expression-rule/
│           │   ├── presentation/
│           │   ├── application/usecases/
│           │   ├── domain/
│           │   └── infrastructure/
│           ├── knowledge/
│           │   ├── presentation/
│           │   ├── application/usecases/
│           │   ├── domain/
│           │   └── infrastructure/
│           ├── auth/
│           │   ├── presentation/
│           │   ├── application/usecases/
│           │   ├── domain/
│           │   └── infrastructure/
│           └── shared/
│               ├── domain/
│               │   ├── models/
│               │   └── gateways/
│               └── infrastructure/
│                   ├── ai/
│                   ├── repositories/
│                   └── db/
├── prisma/
│   └── schema.prisma
└── middleware.ts                     # 認証チェック
```
