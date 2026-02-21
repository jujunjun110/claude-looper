# expression-rule-ui: 表現ルール管理UI実装

## タスク ID・内容
`expression-rule-ui` — shadcn/ui コンポーネント追加 + 表現ルール管理UI（一覧テーブル・フォームダイアログ・削除ボタン）実装

## 作成・変更したファイル
- `apps/content-reviewer/src/components/ui/dialog.tsx` — 新規（@radix-ui/react-dialog ベース）
- `apps/content-reviewer/src/components/ui/table.tsx` — 新規（HTML table ベース）
- `apps/content-reviewer/src/components/ui/label.tsx` — 新規（@radix-ui/react-label ベース）
- `apps/content-reviewer/src/components/ui/textarea.tsx` — 新規（HTML textarea ベース）
- `apps/content-reviewer/src/components/ui/badge.tsx` — 新規（shadcn/ui スタイル）
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/composition/expression-rule.composition.ts` — 新規
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/loaders/expression-rule.loader.ts` — 新規
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/actions/expression-rule.action.ts` — 新規（'use server'）
- `apps/content-reviewer/src/components/rules/expression-rule-table.tsx` — 新規（'use client'）
- `apps/content-reviewer/src/components/rules/expression-rule-form-dialog.tsx` — 新規（'use client'）
- `apps/content-reviewer/src/components/rules/delete-expression-rule-button.tsx` — 新規（'use client'）
- `apps/content-reviewer/src/app/(app)/rules/page.tsx` — 更新（loadExpressionRules + ExpressionRuleTable + 新規登録ボタン）
- `test/unit/.../create-expression-rule.usecase.test.ts` — 修正（既存の型エラー: `id` フィールド削除）
- `apps/content-reviewer/package.json` — @radix-ui/react-label 追加

## 設計判断
- presentation 層（composition/loaders/actions）を DDD ルールに従い作成。`loadCurrentUser()` を呼んで `createdBy` に userId を設定
- shadcn/ui コンポーネントは `npx shadcn` 未使用、直接ファイル作成（ローカル開発環境の制約）
- `@radix-ui/react-label` のみ追加インストール。Table/Textarea/Badge は Radix 不要

## 詰まった点・解決方法
- 既存のテスト (`create-expression-rule.usecase.test.ts`) に `id` フィールドを `CreateExpressionRuleInput` に渡す型エラーがあった → テストから `id` と `validId` を削除して修正

## 次のタスクへの申し送り
- `/rules` ページの UI が完成。E2E テスト（playwright）でページ動作を確認するタスクが次に想定される
- 開発環境（NODE_ENV=development）では Prisma が DB 未設定でもダミーユーザーで動作するが、実際の DB がないと rules 一覧は空で表示される
