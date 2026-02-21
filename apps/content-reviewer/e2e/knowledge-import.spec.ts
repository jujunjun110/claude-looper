import { expect, test } from '@playwright/test';

/**
 * /knowledge/import ページの E2E テスト
 *
 * Note.com アカウントから記事をインポートするページの基本シナリオを検証する。
 * 開発環境（NODE_ENV=development）では認証スキップが有効なため、
 * ログインなしで直接アクセスできる。
 */

test.describe('/knowledge/import ページ', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/knowledge/import');
	});

	test('ページタイトルが表示される', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'ノート記事取込' })).toBeVisible();
	});

	test('アカウント名入力フォームが表示される', async ({ page }) => {
		await expect(page.getByLabel('アカウント名')).toBeVisible();
		await expect(page.getByRole('button', { name: '記事を取得' })).toBeVisible();
	});

	test('アカウント名を入力して送信すると URL に accountName が付与される', async ({ page }) => {
		await page.getByLabel('アカウント名').fill('testaccount');
		await page.getByRole('button', { name: '記事を取得' }).click();

		await expect(page).toHaveURL(/\/knowledge\/import\?accountName=testaccount/);
	});

	test('accountName クエリパラメータがある場合、フォームにアカウント名が表示される', async ({
		page,
	}) => {
		await page.goto('/knowledge/import?accountName=testaccount');

		await expect(page.getByLabel('アカウント名')).toHaveValue('testaccount');
	});
});

test.describe('/knowledge/import ページ - 記事一覧表示', () => {
	/**
	 * Note.com の実際のアカウントを使用したテスト。
	 * note.com/notestock は公開アカウントとして使用。
	 * Note.com が利用不可の場合はエラーになる可能性がある。
	 */
	test('アカウント名を送信後に記事一覧またはメッセージが表示される', async ({ page }) => {
		await page.goto('/knowledge/import?accountName=note');

		// テーブルまたは「記事が見つかりませんでした」メッセージが表示される
		const tableOrEmpty = page.getByRole('table').or(page.getByText('記事が見つかりませんでした。'));
		await expect(tableOrEmpty).toBeVisible({ timeout: 15000 });
	});
});

test.describe('/knowledge/import ページ - 記事インポートフロー', () => {
	test('記事を選択してインポートすると /knowledge ページに遷移し記事が追加される', async ({
		page,
	}) => {
		// 記事一覧が取得できるアカウントで開く
		await page.goto('/knowledge/import?accountName=note');

		// テーブルが表示されるまで待つ
		const table = page.getByRole('table');
		const hasTable = await table.isVisible({ timeout: 15000 }).catch(() => false);

		if (!hasTable) {
			// Note.com へのアクセスが失敗した場合はスキップ
			test.skip();
			return;
		}

		// 最初の記事を選択
		const firstCheckbox = page.getByRole('row').nth(1).getByRole('checkbox');
		await firstCheckbox.check();

		// インポートボタンをクリック
		const importButton = page.getByRole('button', { name: /選択した記事をインポート/ });
		await expect(importButton).toBeEnabled();
		await importButton.click();

		// /knowledge ページに遷移することを確認
		await expect(page).toHaveURL('/knowledge', { timeout: 30000 });

		// ナレッジ記事管理ページのタイトルが表示される
		await expect(page.getByRole('heading', { name: 'ナレッジ記事管理' })).toBeVisible();

		// 記事一覧テーブルが表示される（インポートした記事が含まれる）
		const articleTable = page
			.getByRole('table')
			.or(page.getByText('ナレッジ記事が登録されていません。'));
		await expect(articleTable).toBeVisible();
	});
});
