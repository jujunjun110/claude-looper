# Frontend Rules

Next.js App Router + shadcn/ui + Tailwind CSS におけるフロントエンド規約。

---

## ディレクトリ構成

`apps/{app}/src/` 配下:

| ディレクトリ | 責務 |
|---|---|
| `app/` | ページ（App Router）。page.tsx は loader 呼び出し + props 渡しのみ |
| `components/` | React コンポーネント。`'use client'` でクライアントを明示 |
| `hooks/` | カスタム hooks |
| `lib/` | クライアント側 util（fetcher, formatter 等） |
| `backend/` | サーバーサイド DDD 構造（`architecture.md` 参照） |

---

## Server Components / Client Components

- **デフォルトは Server Component。** `'use client'` は必要な場合のみ付与
- Client Component が必要なケース: SSE ストリーム受信、ユーザーインタラクション、リアルタイム更新
- **初期データは必ず Server Component** (page.tsx + loader) で取得。Client Component は差分のみ fetch

---

## データフロー

### 読み取り

page.tsx → loader (`backend/presentation/loaders/`) → UseCase → Repository

### 副作用

Client Component → action (`backend/presentation/actions/`, `'use server'`) → UseCase → Gateway / Repository

### SSE ストリーム

action が UseCase の `onProgress` コールバックを `ReadableStream` + SSE フォーマットに変換。Client Component 側で `ReadableStream` を consume してリアルタイム表示。

---

## UI スタック

- **shadcn/ui**: コンポーネントライブラリ。`components/ui/` に配置
- **Tailwind CSS**: スタイリング。カスタム CSS は原則不要
- **Biome**: lint / format（タブインデント、シングルクォート、セミコロン必須）
