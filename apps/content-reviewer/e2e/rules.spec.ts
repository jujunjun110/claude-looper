import { expect, test } from '@playwright/test';

/**
 * /rules ページの E2E テスト
 *
 * 表現ルール管理ページの基本シナリオを検証する。
 * 開発環境（NODE_ENV=development）では認証スキップが有効なため、
 * ログインなしで /rules に直接アクセスできる。
 */

test.describe('/rules ページ', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/rules');
	});

	test('ページタイトルが表示される', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '表現ルール管理' })).toBeVisible();
	});

	test('ルール一覧テーブルが表示される', async ({ page }) => {
		// ルール一覧を表示するテーブルまたはリストが存在する
		await expect(
			page.getByRole('table').or(page.getByRole('list', { name: /ルール/ })),
		).toBeVisible();
	});

	test('新規登録ボタンが表示される', async ({ page }) => {
		const addButton = page
			.getByRole('button', { name: /新規登録|ルールを追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|ルールを追加|追加/ }));
		await expect(addButton).toBeVisible();
	});

	test('新規登録フォームが表示される', async ({ page }) => {
		// 新規登録ボタンをクリック
		const addButton = page
			.getByRole('button', { name: /新規登録|ルールを追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|ルールを追加|追加/ }));
		await addButton.click();

		// フォームのフィールドが表示される
		await expect(page.getByLabel(/NG表現|ng表現/i)).toBeVisible();
		await expect(page.getByLabel(/推奨表現/i)).toBeVisible();
	});

	test('ルールを新規登録すると一覧に表示される', async ({ page }) => {
		// 新規登録ボタンをクリック
		const addButton = page
			.getByRole('button', { name: /新規登録|ルールを追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|ルールを追加|追加/ }));
		await addButton.click();

		// フォームに入力
		const ngExpression = `テストNG表現_${Date.now()}`;
		await page.getByLabel(/NG表現|ng表現/i).fill(ngExpression);
		await page.getByLabel(/推奨表現/i).fill('テスト推奨表現');

		// 送信ボタンをクリック
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録したルールが一覧に表示される
		await expect(page.getByText(ngExpression)).toBeVisible();
	});

	test('ルールを編集できる', async ({ page }) => {
		// まず1件登録する
		const addButton = page
			.getByRole('button', { name: /新規登録|ルールを追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|ルールを追加|追加/ }));
		await addButton.click();

		const ngExpression = `編集テスト_${Date.now()}`;
		await page.getByLabel(/NG表現|ng表現/i).fill(ngExpression);
		await page.getByLabel(/推奨表現/i).fill('初期推奨表現');
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録完了を待つ
		await expect(page.getByText(ngExpression)).toBeVisible();

		// 編集ボタンをクリック（登録したルールの行）
		const ruleRow = page.locator(`text=${ngExpression}`).locator('..');
		await ruleRow.getByRole('button', { name: /編集/ }).click();

		// 推奨表現を更新
		const recommendedField = page.getByLabel(/推奨表現/i);
		await recommendedField.clear();
		await recommendedField.fill('更新後推奨表現');
		await page.getByRole('button', { name: /保存|更新/ }).click();

		// 更新内容が反映されている
		await expect(page.getByText('更新後推奨表現')).toBeVisible();
	});

	test('ルールを削除できる', async ({ page }) => {
		// まず1件登録する
		const addButton = page
			.getByRole('button', { name: /新規登録|ルールを追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|ルールを追加|追加/ }));
		await addButton.click();

		const ngExpression = `削除テスト_${Date.now()}`;
		await page.getByLabel(/NG表現|ng表現/i).fill(ngExpression);
		await page.getByLabel(/推奨表現/i).fill('削除対象推奨表現');
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録完了を待つ
		await expect(page.getByText(ngExpression)).toBeVisible();

		// 削除ボタンをクリック
		const ruleRow = page.locator(`text=${ngExpression}`).locator('..');
		await ruleRow.getByRole('button', { name: /削除/ }).click();

		// 確認ダイアログがある場合は確認
		const confirmButton = page.getByRole('button', { name: /確認|はい|削除する/ });
		if (await confirmButton.isVisible()) {
			await confirmButton.click();
		}

		// 削除されて一覧から消えている
		await expect(page.getByText(ngExpression)).not.toBeVisible();
	});
});
