import { expect, test } from './fixtures';

const MOCK_URL = 'https://www.chatwork.com/';

test.beforeEach(async ({ page, gatewayRequests }) => {
  void gatewayRequests;
  await page.goto(MOCK_URL);
  await page.waitForSelector('#_chatText');
  await page.waitForTimeout(300);
});

test('@ 入力でメンバーサジェストが表示される（Issue #2）', async ({ page }) => {
  await page.focus('#_chatText');
  await page.type('#_chatText', '@山');
  const dropdown = page.locator('#cwh-mention-dropdown');
  await expect(dropdown).toBeVisible();
  await expect(dropdown.locator('.cwh-mention-item')).toHaveCount(1);
  await expect(dropdown).toContainText('山田太郎');
});

test('候補クリックで TO タグが挿入される（本家 JS 非依存）', async ({ page }) => {
  await page.focus('#_chatText');
  await page.type('#_chatText', 'おはよう @山');
  await page.locator('#cwh-mention-dropdown .cwh-mention-item').first().click();
  await expect(page.locator('#_chatText')).toHaveValue('おはよう [To:111] 山田太郎さん ');
  await expect(page.locator('#cwh-mention-dropdown')).toHaveCount(0);
});

test('↓ + Enter でサジェストを確定できる', async ({ page }) => {
  await page.focus('#_chatText');
  await page.type('#_chatText', '@'); // 全員表示
  await expect(page.locator('#cwh-mention-dropdown .cwh-mention-item')).toHaveCount(3);
  await page.press('#_chatText', 'ArrowDown'); // 2番目（佐藤花子）へ
  await page.press('#_chatText', 'Enter');
  await expect(page.locator('#_chatText')).toHaveValue('[To:222] 佐藤花子さん ');
});

test('Enter 確定がショートカット判定に伝播しない（改行/送信が起きない）', async ({ page }) => {
  await page.focus('#_chatText');
  await page.type('#_chatText', '@山');
  await page.press('#_chatText', 'Enter');
  // TO タグのみが入り、余計な改行が付かない
  await expect(page.locator('#_chatText')).toHaveValue('[To:111] 山田太郎さん ');
});

test('Esc でサジェストを閉じる', async ({ page }) => {
  await page.focus('#_chatText');
  await page.type('#_chatText', '@山');
  await expect(page.locator('#cwh-mention-dropdown')).toBeVisible();
  await page.press('#_chatText', 'Escape');
  await expect(page.locator('#cwh-mention-dropdown')).toHaveCount(0);
});
