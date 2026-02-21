# Infrastructure Rules

pnpm workspace + Vercel + Supabase によるインフラ規約。

---

## monorepo 構成

pnpm workspace で管理。`apps/` 配下にアプリを配置する。将来のマルチサービス化を見据えた構成。

```
project-root/
├── apps/{app}/          # Next.js App Router アプリ
├── pnpm-workspace.yaml
├── biome.json           # 共有 lint/format 設定
└── package.json         # workspace scripts (lint, typecheck, test, build)
```

---

## デプロイ

| 環境 | トリガー | プラットフォーム |
|---|---|---|
| Preview | PR 作成 / 更新 | Vercel（自動生成、PR ごとに一意の URL） |
| Production | main ブランチへの push | Vercel（自動デプロイ） |

### Vercel 設定

- Framework Preset: Next.js
- Root Directory: `apps/{app}`
- Install Command: `pnpm install --frozen-lockfile`
- Fluid Compute 対応（長時間実行の Server Actions / API Routes に `maxDuration` 設定）

---

## データベース

- **Supabase** PostgreSQL + pgvector（ベクトル検索用）
- **Prisma** でスキーマ管理。`prisma/schema.prisma` をソース・オブ・トゥルースとする
- 環境ごとに Supabase プロジェクトを分離（dev / prod）
- ORM 型 ↔ ドメインモデル変換は infrastructure 層が担当（`architecture.md` 参照）

---

## 認証

- **Supabase Auth** による OAuth 2.0
- Next.js middleware で未認証時リダイレクト
- ドメイン制限はプロジェクト固有設定で定義

---

## CI/CD

GitHub Actions: `pnpm install` → `lint` → `typecheck` → `test`

全パスで PR マージ可能 → main merge で Vercel 自動デプロイ。

---

## セキュリティ

- `.env` / シークレットは **Vercel 環境変数で管理。コミット厳禁**
- サービスロールキーはサーバーサイドのみ使用（`NEXT_PUBLIC_` prefix を付けない）
- `NEXT_PUBLIC_` 付き変数はクライアントに露出することを意識する
