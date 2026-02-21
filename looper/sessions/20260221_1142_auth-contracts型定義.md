# auth-contracts: auth context と shared context の型定義

## タスク ID: auth-contracts

## 作成ファイル
- `src/backend/contexts/shared/domain/models/user-id.model.ts` — UserId branded type + createUserId ファクトリ関数
- `src/backend/contexts/shared/domain/models/email.model.ts` — Email 値オブジェクト（create/equals/toString、Result型でバリデーション）
- `src/backend/contexts/auth/domain/models/user.model.ts` — User interface（id, email, name, avatarUrl, createdAt, updatedAt）
- `src/backend/contexts/auth/domain/gateways/auth.gateway.ts` — AuthGateway interface（getCurrentUser, signInWithGoogle, signOut, onAuthStateChange）
- `src/backend/contexts/auth/domain/gateways/user.repository.ts` — UserRepository interface（findById, findByEmail, upsert）
- `test/unit/contexts/shared/domain/models/email.model.test.ts` — Email の 12 テスト
- `test/unit/contexts/shared/domain/models/user-id.model.test.ts` — UserId の 3 テスト
- `vitest.unit.config.ts` — vitest 設定（@ alias 対応）

## 設計判断
- UserId は branded type + ファクトリ関数で実装（型定義のみのためクラス不要）
- Email は Rich Domain Model としてクラスで実装、create() は Result<T,E> パターンで返す（architecture.md 準拠）
- User は interface で定義（domain 層で不変条件の強制が不要な参照型のため）
- vitest v2 を採用（v4 は ESM-only で CJS の Next.js プロジェクトと非互換）

## 次のタスクへの申し送り
- infrastructure 層で User の ORM 型 ↔ ドメインモデル変換を実装する際、Email.create() の Result 型ハンドリングが必要
- AuthGateway の実装は Supabase Auth を使う（infrastructure.md 参照）
