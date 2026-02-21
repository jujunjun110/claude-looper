# Content Reviewer（コンテンツレビューアー）設計

## 目的

広報チームが、議員のSNS発信コンテンツ（YouTube, X, note等）を全件目視レビューしている負荷を、LLMによる自動チェックで軽減するため。

---

## 1. システム概要

SNS発信コンテンツの事前チェックを自動化するWebアプリケーション。
Slackからのメンションまたは Webフォームからテキストを受け付け、以下5つの観点で自動検証する。

| # | チェック観点 | 手法 |
|---|------------|------|
| 1 | ファクトチェック | Claude組み込みWeb検索で事実確認 |
| 2 | ナレッジ整合性 | Supabase pgvectorでRAG検索し、既存ドキュメントとの不整合を検出 |
| 3 | 表現ルール適合 | 登録済みルール（NG表現→推奨表現）とのマッチング |
| 4 | 炎上リスク判定 | LLMによる一般常識に基づく判定 |
| 5 | 文章クオリティ | 同じ動詞の繰り返し、誤字脱字のチェック |

### 処理フロー

1. コンテンツ受付（Slack or Web）
2. LLMで段落分割（最大30,000字を適切なセグメントに分割）
3. 各セグメントに対して5つのチェックを並列実行
4. 結果を集約してDB保存
5. 結果をSlackスレッドに返信 / Webで表示

---

## 2. 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js (App Router) |
| ホスティング | Vercel |
| データベース | Supabase PostgreSQL + pgvector |
| ORM | Prisma |
| 認証 | Supabase Auth (Google OAuth) |
| LLM | Claude API (Anthropic) |
| Web検索 | Claude組み込みWeb検索ツール |
| ベクトル検索 | Supabase pgvector |
| Slack連携 | Slack Events API + Vercel API Route |
| UI | shadcn/ui + Tailwind CSS |
| lint/format | Biome |

---

## 3. 機能一覧

### A. Slackコンテンツチェック

- `@sns-checker` にメンションされたメッセージをSlack Events APIで受信
- Vercel API Route (`/api/slack/events`) でWebhookを受け付ける
- メンションされたメッセージのテキストを抽出し、チェック処理を非同期実行
- チェック完了後、同スレッドに結果サマリーとWeb上の詳細ページパーマリンクを返信
- Slack Events APIの3秒タイムアウト対策として、受信時に即座に200を返し、バックグラウンドで処理を実行する

### B. Webコンテンツチェック

- テキスト入力フォームでチェック対象の文章を入力
- チェック実行中はSSEでリアルタイムに進捗を表示（セグメントごとの処理状況）
- 完了後に結果詳細ページへ遷移

### C. チェック一覧

- 過去のチェック結果を一覧表示
- ソース種別（Slack / Web）、ステータス、実行日時でフィルタリング
- 各行から詳細ページへ遷移

### D. Google認証

- Supabase Authを利用したGoogleログイン
- Next.js middlewareで未認証時にログインページへリダイレクト
- 開発環境（`NODE_ENV=development`）では認証スキップ可能

### E. 表現ルール管理

- NG表現と推奨表現のペアを登録・編集・削除
- 例: 「国民」→「市民」、「障害者」→「障がいのある方」
- チェック時に表現ルールテーブルを全件取得し、LLMのプロンプトに含めてマッチングする

### F. ナレッジ管理

- ナレッジ記事（マニフェスト、note記事、方針文書等）の手動登録・編集
- タイトル、本文、ソースURL、カテゴリを管理
- 登録・更新時にテキストをチャンク分割し、Embeddingを生成してpgvectorに保存

### G. 記事コンテンツ自動取込（note）

- noteアカウント名を指定して記事URL一覧を取得（note API）
- 取得した記事一覧を表示し、選択した記事をボタンで一括DB保存
- 保存時にEmbeddingも自動生成

---

## 4. ページ構成

| # | ページ | URLパス | 説明 |
|---|--------|---------|------|
| 1 | ログイン | `/login` | Googleログイン |
| 2 | ダッシュボード | `/` | チェック一覧（過去の履歴） |
| 3 | 新規チェック | `/checks/new` | テキスト入力してチェック実行 |
| 4 | チェック結果詳細 | `/checks/[id]` | 検証結果の詳細表示 |
| 5 | 表現ルール管理 | `/rules` | 表現ルールのCRUD |
| 6 | ナレッジ管理 | `/knowledge` | ナレッジの一覧・登録・編集 |
| 7 | 記事取込 | `/knowledge/import` | note記事の一括取込 |

---

## 5. データベース設計

### users

Supabase Auth連携。auth.usersと紐づく。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | Supabase Auth UID |
| email | text | メールアドレス |
| display_name | text | 表示名 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### content_checks

チェック対象のコンテンツ。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | 実行ユーザー（Slack経由の場合はnull可） |
| source_type | text | `slack` / `web` |
| original_text | text | 原文（最大30,000字） |
| status | text | `pending` / `processing` / `completed` / `failed` |
| slack_channel_id | text | Slackチャンネル（Slack経由の場合） |
| slack_thread_ts | text | Slackスレッド（Slack経由の場合） |
| created_at | timestamptz | |
| completed_at | timestamptz | |

### content_segments

コンテンツを段落分割したセグメント。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| content_check_id | uuid (FK → content_checks) | |
| segment_index | integer | セグメント順序 |
| text | text | セグメント本文 |
| status | text | `pending` / `processing` / `completed` / `failed` |
| created_at | timestamptz | |

### check_results

各セグメント×チェック観点ごとの結果。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| content_segment_id | uuid (FK → content_segments) | |
| check_type | text | `fact_check` / `knowledge_consistency` / `expression_rule` / `risk_assessment` / `quality_check` |
| severity | text | `ok` / `warning` / `error` |
| summary | text | チェック結果の要約 |
| details | jsonb | 詳細情報（該当箇所、根拠、推奨修正等） |
| created_at | timestamptz | |

### expression_rules

表現ルール。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| ng_expression | text | NG表現 |
| recommended_expression | text | 推奨表現 |
| note | text | 備考 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### knowledge_articles

ナレッジ記事。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| title | text | タイトル |
| body | text | 本文 |
| source_url | text | ソースURL |
| category | text | カテゴリ（`manifesto` / `note` / `policy` / `other`） |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### knowledge_embeddings

ナレッジのチャンク＋ベクトル埋め込み。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| knowledge_article_id | uuid (FK → knowledge_articles) | |
| chunk_index | integer | チャンク順序 |
| chunk_text | text | チャンク本文 |
| embedding | vector(1536) | Embeddingベクトル |
| created_at | timestamptz | |

---

## 6. バックエンドアーキテクチャ

`docs/architecture.md` の DDD 4層構造に準拠する。

### ディレクトリ構成

```
apps/content-reviewer/src/backend/
├── presentation/
│   ├── composition/         # UseCase + infrastructure実装の組み立て
│   ├── loaders/             # データ取得（Server Component用）
│   └── actions/             # 副作用（Server Actions）
├── usecases/
│   ├── execute-content-check.usecase.ts
│   ├── split-content.usecase.ts
│   ├── run-fact-check.usecase.ts
│   ├── run-knowledge-check.usecase.ts
│   ├── run-expression-check.usecase.ts
│   ├── run-risk-check.usecase.ts
│   ├── run-quality-check.usecase.ts
│   ├── manage-expression-rules.usecase.ts
│   ├── manage-knowledge.usecase.ts
│   └── import-note-articles.usecase.ts
├── models/
│   ├── content-check.model.ts
│   ├── content-segment.model.ts
│   ├── check-result.model.ts
│   ├── expression-rule.model.ts
│   └── knowledge-article.model.ts
├── services/
│   └── content-review.service.ts    # 5つのチェックのオーケストレーション
├── gateways/
│   ├── ai.gateway.ts                # 汎用AI Gateway interface
│   ├── web-search.gateway.ts        # Web検索 Gateway interface
│   ├── embedding.gateway.ts         # Embedding Gateway interface
│   ├── content-check.repository.ts
│   ├── expression-rule.repository.ts
│   ├── knowledge.repository.ts
│   └── slack.gateway.ts             # Slack通知 Gateway interface
└── infrastructure/
    ├── ai/
    │   ├── claude.ai-gateway.ts         # Claude API実装
    │   ├── claude.web-search-gateway.ts # Claude Web検索実装
    │   └── claude.embedding-gateway.ts  # Embedding実装
    ├── repositories/
    │   ├── supabase-content-check.repository.ts
    │   ├── supabase-expression-rule.repository.ts
    │   └── supabase-knowledge.repository.ts
    └── slack/
        └── slack-api.gateway.ts         # Slack API実装
```

### AI Gateway

`docs/architecture.md` のルールに従い、汎用interfaceとして定義する。

```
// domain/gateways/ai.gateway.ts
interface AIGateway {
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>
  generateWithWebSearch(prompt: string, options?: WebSearchOptions): Promise<GenerateResult>
}
```

プロンプト生成・レスポンスパースは各UseCaseが担当する。

### チェック並列実行

`content-review.service.ts`（Domain Service）が5つのチェック結果の集約を担当。
`execute-content-check.usecase.ts`（UseCase）が各チェックUseCaseの並列呼び出しを `Promise.all` でオーケストレーションする。

---

## 7. Slack連携詳細

### 受信フロー

1. Slack Events APIがVercel API Route `/api/slack/events` にPOST
2. `url_verification` チャレンジに対応
3. `app_mention` イベントを受信したら即座に200レスポンスを返す
4. バックグラウンドで `execute-content-check` UseCaseを呼び出し
5. 完了後、Slack APIでスレッドに結果を返信

### タイムアウト対策

Slack Events APIは3秒以内のレスポンスを要求するため、以下の流れで処理する：

1. API Routeでイベントを受信し、即座に200を返す
2. `waitUntil`（Vercelランタイム）を使い、レスポンス返却後もバックグラウンドで処理を継続
3. 処理完了後にSlack APIで結果を投稿

### Slack返信フォーマット

```
:white_check_mark: コンテンツチェック完了

■ 全体結果: 警告 2件 / エラー 0件

【警告】セグメント2 - ファクトチェック
  → 「〇〇法は2023年に施行」→ 正しくは2024年施行

【警告】セグメント5 - 表現ルール
  → 「障害者」→ 推奨: 「障がいのある方」

:mag: 詳細: https://example.com/checks/xxx-xxx
```

---

## 8. コンテンツ分割ロジック

最大30,000字のコンテンツをLLMが適切に処理できるサイズに分割する。

### 分割方針

- LLMに原文を渡し、意味的なまとまり（段落、セクション）ごとに分割を指示
- 各セグメントは2,000〜5,000字を目安
- 分割結果はJSON配列で返却させ、パースしてDB保存

---

## 9. RAG検索（ナレッジ整合性チェック）

### Embedding生成

- ナレッジ記事登録・更新時にテキストを500〜1,000字程度のチャンクに分割
- 各チャンクのEmbeddingを生成し、`knowledge_embeddings` テーブルに保存
- Embeddingモデルは Voyageまたは OpenAI text-embedding-3-small を利用（Claudeには Embedding APIがないため外部モデルを使用）

### 検索フロー

1. チェック対象セグメントのテキストからEmbeddingを生成
2. pgvectorのコサイン類似度検索で上位k件の関連チャンクを取得
3. 関連チャンクをコンテキストとしてLLMに渡し、整合性を判定

---

## 10. note記事取込

### 取込フロー

1. ユーザーがnoteアカウント名を入力
2. note API (`https://note.com/api/v2/creators/{username}/contents`) で記事一覧を取得
3. 取得した記事一覧を表示（タイトル、公開日、URL）
4. ユーザーが保存したい記事を選択
5. 各記事の本文を取得し、`knowledge_articles` テーブルに保存
6. 保存と同時にEmbeddingを生成して `knowledge_embeddings` に保存

---

## 11. 認証・認可

### Google認証フロー

1. `/login` ページでGoogleログインボタンを表示
2. Supabase Auth の `signInWithOAuth({ provider: 'google' })` を呼び出し
3. コールバック後、セッションを確立
4. Next.js middleware で全ページ（`/login` 除く）の認証チェック

### 開発環境スキップ

- `NODE_ENV=development` の場合、middlewareで認証チェックをスキップ
- ダミーユーザーでセッションを模擬

---

## 12. API Route

原則API Routeは使用しないが、以下は外部Webhook受信のため例外として許可：

| パス | メソッド | 用途 |
|------|---------|------|
| `/api/slack/events` | POST | Slack Events API Webhook受信 |
