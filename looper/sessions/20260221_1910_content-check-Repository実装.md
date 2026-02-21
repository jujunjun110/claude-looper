# content-check-repositories: Prisma Repository 実装3種

## タスク ID
content-check-repositories

## 内容
content-check context の Prisma Repository 実装3種を新規作成。

## 作成・変更ファイル

### 実装ファイル（新規）
- `src/backend/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.ts`
- `src/backend/contexts/content-check/infrastructure/repositories/prisma-content-segment.repository.ts`
- `src/backend/contexts/content-check/infrastructure/repositories/prisma-check-result.repository.ts`

### テストファイル（新規）
- `test/unit/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.test.ts`
- `test/unit/contexts/content-check/infrastructure/repositories/prisma-content-segment.repository.test.ts`
- `test/unit/contexts/content-check/infrastructure/repositories/prisma-check-result.repository.test.ts`

## 設計判断

- **source フィールド**: Prisma の ContentCheck に `source: Source` (non-nullable) があるが、ドメインモデルにはない。`toPrisma` ではデフォルト `'web'` を設定
- **failedReason**: ドメインモデルにあるが Prisma スキーマにはない。`toDomain` では `null` 固定
- **CheckResult.contentCheckId**: Prisma には直接ない（セグメント経由）。`findBySegmentId` / `findByContentCheckId` では `include: { contentSegment: { select: { contentCheckId: true } } }` でジョイン取得
- **updatedAt の省略**: `ContentSegment` の domain model には `updatedAt` がないため `toPrisma` から除外（Prisma の `@updatedAt` が自動管理）
- **Unit テスト戦略**: ドメインモデルの `reconstruct` / `create` が全て `throw new Error('not implemented')` のため、`Object.assign(Object.create(Model.prototype), {...})` で mock instance 生成、`vi.spyOn(Model, 'reconstruct')` で toDomain をテスト

## 詰まった点・解決方法
- Biome の import order ルールで lint エラー → `biome check --write` で自動修正

## 次のタスクへの申し送り
- ドメインモデルの `reconstruct` / `create` / `startProcessing` / `complete` / `fail` が未実装（skeleton）。これらを実装すると自動的に Repository の toDomain も動作するようになる
- `failedReason` と `source` フィールドのマッピングは将来的なスキーマ追加か設計見直しが必要
