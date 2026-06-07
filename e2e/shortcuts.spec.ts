import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const MOCK_URL = 'https://www.chatwork.com/';

/** チャット欄に値を入れて Enter を押す（content script が IME 非変換 Enter を検知する） */
async function typeAndEnter(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
  await page.focus(selector);
  await page.press(selector, 'Enter');
}

test.beforeEach(async ({ page, gatewayRequests }) => {
  void gatewayRequests; // route 登録を有効化
  await page.goto(MOCK_URL);
  await page.waitForSelector('#_chatText');
  // content script の keydown リスナ登録を待つ
  await page.waitForTimeout(300);
});

test('@@ → [toall] に置換される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', '@@');
  await expect(page.locator('#_chatText')).toHaveValue('[toall]');
});

test(':info → タグに展開される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':info');
  await expect(page.locator('#_chatText')).toHaveValue('[info]\n[/info]');
});

test(':title / :code → タグに展開される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':title');
  await expect(page.locator('#_chatText')).toHaveValue('[title]\n[/title]');

  await typeAndEnter(page, '#_chatText', ':code');
  await expect(page.locator('#_chatText')).toHaveValue('[code]\n[/code]');
});

test(':to → TO リストボタンがクリックされコマンドが消える', async ({ page }) => {
  let clicked = false;
  await page.exposeFunction('__markToClicked', () => {
    clicked = true;
  });
  await page.evaluate(() => {
    document.querySelector('#_to')?.addEventListener('click', () => {
      (window as unknown as { __markToClicked: () => void }).__markToClicked();
    });
  });
  await typeAndEnter(page, '#_chatText', ':to');
  await expect(page.locator('#_chatText')).toHaveValue('');
  expect(clicked).toBe(true);
});

test(':file → ファイルアップロードボタンがクリックされる', async ({ page }) => {
  let clicked = false;
  await page.exposeFunction('__markFileClicked', () => {
    clicked = true;
  });
  await page.evaluate(() => {
    document.querySelector('#_file')?.addEventListener('click', () => {
      (window as unknown as { __markFileClicked: () => void }).__markFileClicked();
    });
  });
  await typeAndEnter(page, '#_chatText', ':file');
  await expect(page.locator('#_chatText')).toHaveValue('');
  expect(clicked).toBe(true);
});

test(':f → 検索ボックスにフォーカスが移る', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':f');
  await expect(page.locator('#_chatText')).toHaveValue('');
  await expect(page.locator('#_search')).toBeFocused();
});

test(':me → 自分宛て TO のメッセージのみ表示される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':me');
  await expect(page.locator('[data-mid="m-1"]')).toBeVisible();
  await expect(page.locator('[data-mid="m-2"]')).toBeHidden();
  await expect(page.locator('[data-mid="m-3"]')).toBeHidden();
});

test(':mine → 自分の送信メッセージのみ表示される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':mine');
  await expect(page.locator('[data-mid="m-1"]')).toBeHidden();
  await expect(page.locator('[data-mid="m-2"]')).toBeVisible();
  await expect(page.locator('[data-mid="m-3"]')).toBeHidden();
});

test(':all → 全メッセージが再表示される', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', ':me');
  await expect(page.locator('[data-mid="m-3"]')).toBeHidden();
  await typeAndEnter(page, '#_chatText', ':all');
  await expect(page.locator('[data-mid="m-1"]')).toBeVisible();
  await expect(page.locator('[data-mid="m-2"]')).toBeVisible();
  await expect(page.locator('[data-mid="m-3"]')).toBeVisible();
});

test(':task → 本文がタスク名入力欄へ移る', async ({ page }) => {
  await typeAndEnter(page, '#_chatText', 'バグを直す\n:task');
  await expect(page.locator('#_chatText')).toHaveValue('');
  await expect(page.locator('#_taskNameInput')).toHaveValue('バグを直す\n');
});

test('タスク欄の :to → 担当者リストボタンがクリックされる', async ({ page }) => {
  let clicked = false;
  await page.exposeFunction('__markInchargeClicked', () => {
    clicked = true;
  });
  await page.evaluate(() => {
    document.querySelector('#_inchargeEmpty')?.addEventListener('click', () => {
      (window as unknown as { __markInchargeClicked: () => void }).__markInchargeClicked();
    });
  });
  await typeAndEnter(page, '#_taskNameInput', 'レビュー\n:to');
  expect(clicked).toBe(true);
  await expect(page.locator('#_taskNameInput')).toHaveValue('レビュー\n');
});
