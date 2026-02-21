## タスク
- ID: expression-rule-contracts
- 内容: expression-rule context の契約定義（ExpressionRuleId, ExpressionRule, ExpressionRuleRepository）

## 作成ファイル
- `apps/content-reviewer/src/backend/contexts/shared/domain/models/expression-rule-id.model.ts` — ExpressionRuleId branded type + UUID バリデーション
- `apps/content-reviewer/src/backend/contexts/expression-rule/domain/models/expression-rule.model.ts` — ExpressionRule Rich Domain Model（create/reconstruct/update/deactivate/activate）
- `apps/content-reviewer/src/backend/contexts/expression-rule/domain/gateways/expression-rule.repository.ts` — ExpressionRuleRepository interface
- `apps/content-reviewer/test/unit/contexts/shared/domain/models/expression-rule-id.model.test.ts` — ExpressionRuleId テスト（6件）
- `apps/content-reviewer/test/unit/contexts/expression-rule/domain/models/expression-rule.model.test.ts` — ExpressionRule テスト（13件）

## 設計判断
- ExpressionRuleId は UserId と異なり UUID バリデーション付き（DB スキーマが UUID PK のため）
- ExpressionRule.reconstruct() を追加：Repository からの復元用（isActive=false 等の状態をそのまま復元）
- Result 型はファイルローカルで定義（auth context の User.model.ts と同パターン）
- 不変オブジェクトパターン：update/deactivate/activate は新しいインスタンスを返す

## 次のタスクへの申し送り
- ExpressionRule の infrastructure 層（Prisma Repository 実装）が次のステップ
- content-check context の ExpressionRuleProvider interface は別 context で定義予定
