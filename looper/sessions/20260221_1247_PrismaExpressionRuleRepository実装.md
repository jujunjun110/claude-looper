# タスク: expression-rule-repository-impl

## タスク内容
`PrismaExpressionRuleRepository` を実装。`ExpressionRuleRepository` interface を implements し、Prisma ↔ ドメインモデル変換（toDomain / toPrisma private メソッド）を行う。

## 作成・変更したファイル
- `apps/content-reviewer/src/backend/contexts/expression-rule/infrastructure/repositories/prisma-expression-rule.repository.ts`（新規: 実装本体）
- `apps/content-reviewer/test/unit/contexts/expression-rule/infrastructure/repositories/prisma-expression-rule.repository.test.ts`（新規: 単体テスト）

## 設計判断
- `save` は `upsert` で実装（create / update を統一）。`update` 句には `createdBy` / `createdAt` を含めない（不変フィールドは更新しない）
- `toDomain` で `ExpressionRule.reconstruct()` を使用（バリデーションをスキップしてDBデータを直接復元）
- `toPrisma` は `prisma.expressionRule.upsert` の `create` データ形状に合わせた plain object を返す
- `findActive` は `isActive: true` フィルタのみ。ビジネスロジックは domain 層に留める
- 単体テストは Prisma をモックして DB 接続不要で実行（vitest `vi.fn()` + `unknown as PrismaClient`）

## 詰まった点・解決方法
- Biome の import 順序エラー（`type` import と通常 import の順序）→ `createUserId` より `type ExpressionRuleId` を先に配置して解決
- テストファイルの関数シグネチャのフォーマットエラー → 引数リストが長い場合に `(` の後で改行するスタイルに修正

## 次のタスクへの申し送り
- `PrismaExpressionRuleRepository` は DI 経由で利用。`presentation/composition` に composition 関数を追加する際はこのクラスを `PrismaClient` と共にインスタンス化して UseCase に注入する
- DB インテグレーションテストは `DATABASE_URL` 環境変数が必要なため今回は未実施
