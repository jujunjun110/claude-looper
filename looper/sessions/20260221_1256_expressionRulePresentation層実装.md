# expression-rule-presentation: expression-rule context の presentation 層実装

## タスク ID と内容

`expression-rule-presentation` — expression-rule context の presentation 層を実装。

## 作成・変更したファイル一覧

**新規作成:**
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/composition/expression-rule.composition.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/loaders/expression-rules.loader.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/actions/create-expression-rule.action.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/actions/update-expression-rule.action.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/actions/delete-expression-rule.action.ts`

**既存ファイル修正:**
- `apps/content-reviewer/src/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase.ts`
  — `CreateExpressionRuleInput` に `id?: ExpressionRuleId` をオプショナルで追加（テストの要求に合わせる）

## 設計判断

- composition は非同期不要（PrismaClient は既に初期化済みの `prisma` シングルトンを使用）ため同期ファクトリ関数として実装
- auth context の presentation 層をパターンとして参照
- create action での `createdBy` は `NODE_ENV === 'development'` でダミーユーザー ID（`dummy-user-id`）を使用
- `pnpm verify` 実行中に既存テスト(`test/unit/...`)が `CreateExpressionRuleInput` に `id` を渡していて型エラー発生。UseCase の Input に `id?: ExpressionRuleId` を追加して解消

## 詰まった点・解決方法

- `test/unit/` 配下のテストが `id` を `CreateExpressionRuleInput` に渡していたため型エラー。UseCase の Input インターフェースに `id` をオプショナル追加で対処。既存動作は変わらない（`input.id ?? randomUUID()`）

## 次のタスクへの申し送り

- `/rules` ページ（UI）がまだスタブのため、presentation 層を使った実装が次のステップになる
- E2E テスト（`e2e/rules.spec.ts`）は presentation 層が揃ったので実行可能になった
