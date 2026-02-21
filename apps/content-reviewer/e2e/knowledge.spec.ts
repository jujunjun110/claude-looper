import { expect, test } from '@playwright/test';

/**
 * /knowledge ページの E2E テスト
 *
 * ナレッジ記事管理ページの基本シナリオを検証する。
 * 開発環境（NODE_ENV=development）では認証スキップが有効なため、
 * ログインなしで /knowledge に直接アクセスできる。
 */

test.describe('/knowledge ページ', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/knowledge');
	});

	test('ページタイトルが表示される', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'ナレッジ記事管理' })).toBeVisible();
	});

	test('ナレッジ記事一覧テーブルが表示される', async ({ page }) => {
		// テーブルまたは「登録されていません」メッセージが存在する
		const tableOrEmpty = page
			.getByRole('table')
			.or(page.getByText('ナレッジ記事が登録されていません。'));
		await expect(tableOrEmpty).toBeVisible();
	});

	test('新規登録ボタンが表示される', async ({ page }) => {
		const addButton = page
			.getByRole('button', { name: /新規登録|記事を追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|記事を追加|追加/ }));
		await expect(addButton).toBeVisible();
	});

	test('新規登録フォームが表示される', async ({ page }) => {
		// 新規登録ボタンをクリック
		const addButton = page
			.getByRole('button', { name: /新規登録|記事を追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|記事を追加|追加/ }));
		await addButton.click();

		// フォームのフィールドが表示される
		await expect(page.getByLabel(/タイトル/i)).toBeVisible();
		await expect(page.getByLabel(/内容/i)).toBeVisible();
	});

	test('ナレッジ記事を新規登録すると一覧に表示される', async ({ page }) => {
		// 新規登録ボタンをクリック
		const addButton = page
			.getByRole('button', { name: /新規登録|記事を追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|記事を追加|追加/ }));
		await addButton.click();

		// フォームに入力
		const articleTitle = `テスト記事_${Date.now()}`;
		await page.getByLabel(/タイトル/i).fill(articleTitle);
		await page.getByLabel(/内容/i).fill('テスト用のナレッジ内容です。');

		// 送信ボタンをクリック
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録した記事が一覧に表示される
		await expect(page.getByText(articleTitle)).toBeVisible();
	});

	test('ナレッジ記事を編集できる', async ({ page }) => {
		// まず1件登録する
		const addButton = page
			.getByRole('button', { name: /新規登録|記事を追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|記事を追加|追加/ }));
		await addButton.click();

		const articleTitle = `編集テスト_${Date.now()}`;
		await page.getByLabel(/タイトル/i).fill(articleTitle);
		await page.getByLabel(/内容/i).fill('初期内容');
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録完了を待つ
		await expect(page.getByText(articleTitle)).toBeVisible();

		// 編集ボタンをクリック（登録した記事の行）
		const articleRow = page.locator(`text=${articleTitle}`).locator('..');
		await articleRow.getByRole('button', { name: /編集/ }).click();

		// 内容を更新
		const contentField = page.getByLabel(/内容/i);
		await contentField.clear();
		await contentField.fill('更新後の内容');
		await page.getByRole('button', { name: /保存|更新/ }).click();

		// 更新内容が反映されている（タイトルは変わらず表示）
		await expect(page.getByText(articleTitle)).toBeVisible();
	});

	test('ナレッジ記事を削除できる', async ({ page }) => {
		// まず1件登録する
		const addButton = page
			.getByRole('button', { name: /新規登録|記事を追加|追加/ })
			.or(page.getByRole('link', { name: /新規登録|記事を追加|追加/ }));
		await addButton.click();

		const articleTitle = `削除テスト_${Date.now()}`;
		await page.getByLabel(/タイトル/i).fill(articleTitle);
		await page.getByLabel(/内容/i).fill('削除対象の内容');
		await page.getByRole('button', { name: /保存|登録|作成/ }).click();

		// 登録完了を待つ
		await expect(page.getByText(articleTitle)).toBeVisible();

		// 削除ボタンをクリック
		const articleRow = page.locator(`text=${articleTitle}`).locator('..');
		await articleRow.getByRole('button', { name: /削除/ }).click();

		// 確認ダイアログがある場合は確認
		const confirmButton = page.getByRole('button', { name: /確認|はい|削除する|削除/ }).last();
		if (await confirmButton.isVisible()) {
			await confirmButton.click();
		}

		// 削除されて一覧から消えている
		await expect(page.getByText(articleTitle)).not.toBeVisible();
	});
});
