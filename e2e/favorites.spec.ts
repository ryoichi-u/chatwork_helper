import { expect, test } from './fixtures';

const MOCK_URL = 'https://www.chatwork.com/';

test.beforeEach(async ({ page, gatewayRequests }) => {
  void gatewayRequests;
  await page.goto(MOCK_URL);
  await page.waitForSelector('#_sideChatMoveMyChat');
});

test('メッセージホバーで「あとで読む」ボタンが現れ、保存できる', async ({ page }) => {
  const message = page.locator('[data-mid="m-3"]');
  await message.hover();
  const saveButton = message.locator('.cwh-fav-save');
  await expect(saveButton).toHaveText('★ あとで読む');
  await saveButton.click();
  await expect(saveButton).toHaveText('★ 保存済み');
});

test('保存したメッセージがパネルに表示され、ジャンプできる', async ({ page }) => {
  // 保存
  await page.locator('[data-mid="m-3"]').hover();
  await page.locator('[data-mid="m-3"] .cwh-fav-save').click();

  // パネルを開く
  await page.locator('#cwh-favorites-toggle').click();
  const panel = page.locator('#cwh-favorites-panel');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.cwh-fav-item')).toHaveCount(1);

  // 本文クリックでジャンプ（ロード済みなのでパネルが閉じる）
  await panel.locator('.cwh-fav-text').click();
  await expect(panel).toHaveCount(0);
});

test('パネルから削除できる', async ({ page }) => {
  await page.locator('[data-mid="m-3"]').hover();
  await page.locator('[data-mid="m-3"] .cwh-fav-save').click();

  await page.locator('#cwh-favorites-toggle').click();
  const panel = page.locator('#cwh-favorites-panel');
  await expect(panel.locator('.cwh-fav-item')).toHaveCount(1);

  await panel.locator('.cwh-fav-item button').click();
  await expect(panel.locator('.cwh-fav-empty')).toBeVisible();
});

test('保存は再読み込み後も永続化される（chrome.storage.local）', async ({ page }) => {
  await page.locator('[data-mid="m-3"]').hover();
  await page.locator('[data-mid="m-3"] .cwh-fav-save').click();
  await expect(page.locator('[data-mid="m-3"] .cwh-fav-save')).toHaveText('★ 保存済み');

  await page.reload();
  await page.waitForSelector('#_sideChatMoveMyChat');
  await page.locator('#cwh-favorites-toggle').click();
  await expect(page.locator('#cwh-favorites-panel .cwh-fav-item')).toHaveCount(1);
});
