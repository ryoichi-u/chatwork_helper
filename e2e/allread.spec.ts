import { expect, test } from './fixtures';

const MOCK_URL = 'https://www.chatwork.com/';

// gatewayRequests フィクスチャを beforeEach で受けて context.route を先に登録する
test.beforeEach(async ({ page, gatewayRequests }) => {
  void gatewayRequests;
  await page.goto(MOCK_URL);
  await page.waitForSelector('[data-testid="room-list-header_room-list-filter-button"]');
  // content script が credentials 取得 → 全既読ボタン設置するまで待つ
  await page.waitForSelector('#_openedButton');
});

test('全既読ボタンがルーム一覧ヘッダに設置される', async ({ page }) => {
  const button = page.locator('#_openedButton');
  await expect(button).toBeVisible();
  // フィルタボタンの直前に挿入されている
  await expect(
    page.locator('#_openedButton + [data-testid="room-list-header_room-list-filter-button"]'),
  ).toHaveCount(1);
});

test('全既読ボタンのクリックで未読ルームのみ既読化 POST が飛ぶ', async ({
  page,
  gatewayRequests,
}) => {
  await page.locator('#_openedButton').click();

  // 未読ルーム (rid=100, 300) の2件に POST が飛ぶのを待つ
  await expect.poll(() => gatewayRequests.length).toBe(2);

  const roomIds = gatewayRequests.map((r) => r.body.room_id).sort();
  expect(roomIds).toEqual(['100', '300']);

  // ACCESS_TOKEN（ページ変数）が _t として正しく載っている
  for (const req of gatewayRequests) {
    expect(req.body._t).toBe('mock-access-token');
    expect(req.body.unread).toBe('0');
    expect(req.url).toContain('myid=12345');
  }

  // DOM 上にメッセージがある rid=100 は last_chat_id を含む
  const room100 = gatewayRequests.find((r) => r.body.room_id === '100');
  expect(room100?.body.last_chat_id).toBe('m-3');
});
