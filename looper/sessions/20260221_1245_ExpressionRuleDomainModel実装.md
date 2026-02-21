# ExpressionRule Rich Domain Model 実装

## タスク ID
expression-rule-domain-model

## 内容
ExpressionRule Rich Domain Model の実装とユニットテストの作成。

## 作成・変更したファイル

### 既存（前コミットで実装済み）
- `apps/content-reviewer/src/backend/contexts/shared/domain/models/expression-rule-id.model.ts` — ExpressionRuleId branded type（UUID バリデーション付き）
- `apps/content-reviewer/src/backend/contexts/expression-rule/domain/models/expression-rule.model.ts` — ExpressionRule Rich Domain Model（private constructor, create/reconstruct/update/deactivate/activate）
- `apps/content-reviewer/test/unit/contexts/expression-rule/domain/models/expression-rule.model.test.ts` — ExpressionRule のユニットテスト（13 tests）

### 新規作成（このセッション）
- `apps/content-reviewer/src/backend/contexts/shared/domain/models/__tests__/expression-rule-id.model.test.ts` — ExpressionRuleId のユニットテスト（6 tests）

## 設計判断

- ExpressionRule は前コミット（db76976）でスケルトン → 完全実装に変更済みだったため、モデル実装は追加不要だった
- 不足していたのは `expression-rule-id.model.test.ts` のみ（`src/backend/.../` 配下の `__tests__/` に配置）
- UUID バリデーション（空文字・空白のみ・UUID フォーマット違反）を網羅するテストケースを追加

## 詰まった点・解決方法

なし。既存実装が要件を満たしていたため、不足テストのみ追加。

## 次のタスクへの申し送り

- `pnpm verify` 全通過（94 tests passed）
- ExpressionRule の create/reconstruct/update/deactivate/activate すべてテスト済み
- 次のタスクは expression-rule context の application 層（UseCase）または infrastructure 層（Repository 実装）の実装と思われる
