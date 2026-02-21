# タスク: note-scraper-contract

## 内容
`src/backend/contexts/knowledge/domain/gateways/note-scraper.gateway.ts` を新規作成

## 作成・変更したファイル
- `apps/content-reviewer/src/backend/contexts/knowledge/domain/gateways/note-scraper.gateway.ts` （新規）

## 設計判断
- `NoteArticleSummary` は `type` として定義（純粋なデータ構造）
- `NoteScraperGateway` は `interface` として定義（実装は infrastructure 層に委譲）
- domain/gateways/ に配置するのは architecture.md の Gateway/Repository パターンの規約に従うため
- バレルエクスポート（index.ts）は禁止規約に従い作成しない

## 詰まった点・解決方法
- `pnpm verify` 実行時に biome が見つからないエラー → `pnpm install` で node_modules を再インストールして解決

## 次のタスクへの申し送り
- この Gateway の infrastructure 実装（NoteScraperGateway を implements する具体クラス）はまだ未実装
- note.com への実際のスクレイピングロジックは infrastructure 層に実装する必要がある
