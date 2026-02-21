# ExpressionRule UseCase 4種実装

## タスク ID と内容
- タスク ID: expression-rule-usecases
- expression-rule context の UseCase 4種を実装

## 作成・変更したファイル一覧

### UseCase 実装
- `apps/content-reviewer/src/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/application/usecases/update-expression-rule.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/application/usecases/delete-expression-rule.usecase.ts`
- `apps/content-reviewer/src/backend/contexts/expression-rule/application/usecases/list-expression-rules.usecase.ts`

### テスト
- `apps/content-reviewer/test/unit/contexts/expression-rule/application/usecases/create-expression-rule.usecase.test.ts`
- `apps/content-reviewer/test/unit/contexts/expression-rule/application/usecases/update-expression-rule.usecase.test.ts`
- `apps/content-reviewer/test/unit/contexts/expression-rule/application/usecases/delete-expression-rule.usecase.test.ts`
- `apps/content-reviewer/test/unit/contexts/expression-rule/application/usecases/list-expression-rules.usecase.test.ts`

## 設計判断

- クラスベース + constructor DI（`private readonly repository: ExpressionRuleRepository`）で統一
- `execute()` メソッドで公開インターフェースを統一
- domain の Result 型の失敗を application 層で throw に変換（architecture.md の規約に準拠）
- update/delete は findById で存在確認し、未存在なら `throw new Error('ExpressionRule not found: ...')`
- CreateUseCase は Input interface を定義してパラメータを構造化

## 詰まった点・解決方法

- biome の import 順序・フォーマットエラー: `npx biome check --write` で自動修正して解決

## 次のタスクへの申し送り

- 次は infrastructure 層（Prisma Repository 実装）または presentation 層（composition/loader/action）が続く想定
- ExpressionRuleRepository の実装（`infrastructure/repositories/`）がまだ未実装
- `findActive()` は ListUseCase では使っていないが、repository interface に定義済み
