# content-check-contracts 実装

## タスク ID
content-check-contracts

## 内容
content-check context の全契約定義（W2以降の全タスクが参照する基盤）

## 作成ファイル一覧

### 共有 ID 型（branded type + UUID バリデーション）
- `src/backend/contexts/shared/domain/models/content-check-id.model.ts`
- `src/backend/contexts/shared/domain/models/content-segment-id.model.ts`
- `src/backend/contexts/shared/domain/models/check-result-id.model.ts`

### 共有 AI Gateway interface
- `src/backend/contexts/shared/domain/gateways/ai.gateway.ts`（GenerateOptions 型 + AIGateway interface）

### content-check ドメインモデル（骨格）
- `src/backend/contexts/content-check/domain/models/content-check.model.ts`
- `src/backend/contexts/content-check/domain/models/content-segment.model.ts`
- `src/backend/contexts/content-check/domain/models/check-result.model.ts`

### content-check Gateway/Repository interfaces
- `src/backend/contexts/content-check/domain/gateways/content-check.repository.ts`（ContentCheckFilter 含む）
- `src/backend/contexts/content-check/domain/gateways/content-segment.repository.ts`
- `src/backend/contexts/content-check/domain/gateways/check-result.repository.ts`
- `src/backend/contexts/content-check/domain/gateways/expression-rule.provider.ts`
- `src/backend/contexts/content-check/domain/gateways/knowledge-search.gateway.ts`

### ユニットテスト
- `test/unit/contexts/shared/domain/models/content-check-id.model.test.ts`
- `test/unit/contexts/shared/domain/models/content-segment-id.model.test.ts`
- `test/unit/contexts/shared/domain/models/check-result-id.model.test.ts`
- `test/unit/contexts/content-check/domain/models/content-check.model.test.ts`
- `test/unit/contexts/content-check/domain/models/content-segment.model.test.ts`
- `test/unit/contexts/content-check/domain/models/check-result.model.test.ts`

## 設計判断
- ID 型は既存の KnowledgeArticleId と同じパターン（UUID バリデーション付き）で統一
- ContentCheckProps に `failedReason: string | null` を追加（fail() メソッドで理由を保持するため）
- ContentSegmentProps は `segmentIndex` を含む（順序管理が必要なため）
- CheckResultProps は `suggestion: string | null` を含む（修正提案を任意で持てるよう）
- モデルのメソッドボディは全て `throw new Error('not implemented')` でスケルトン化
- AI Gateway は `shared/domain/gateways/` に置き複数 context から再利用可能にした

## 次のタスクへの申し送り
- W2 以降のタスクでは各モデルの `create`/`reconstruct`/状態遷移メソッドを実装する
- ContentCheck の `failedReason` フィールドは `fail(reason?)` 実装時に使用
- `pnpm verify` は 257 tests pass で全て通過済み
