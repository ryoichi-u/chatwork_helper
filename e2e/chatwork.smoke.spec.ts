import { test as base, chromium, expect, type BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = resolve(__dirname, '../.output/chrome-mv3');
const AUTH_FILE = resolve(__dirname, '../playwright/.auth/chatwork.json');

/**
 * 実 Chatwork に対するスモークテスト（ローカル専用・CI 非対象）。
 *
 * 前提: 事前に `npm run smoke:auth` で認証情報を保存しておくこと。
 * 方針: 破壊的操作（実際の既読化 POST）は一切行わず、UI 注入・ボタン表示・
 *   ショートカットの非破壊系（タグ展開等）のみを検証する。
 */
const test = base.extend<{ context: BrowserContext }>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: false,
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
    });
    // persistent context は storageState を直接受け取れないため cookie を手動投入する
    if (existsSync(AUTH_FILE)) {
      const state = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as {
        cookies?: Parameters<BrowserContext['addCookies']>[0];
      };
      if (state.cookies?.length) await context.addCookies(state.cookies);
    }
    await use(context);
    await context.close();
  },
});

test.skip(
  !existsSync(AUTH_FILE),
  '認証情報が未保存です。`npm run smoke:auth` を先に実行してください。',
);

test('実 Chatwork で全既読ボタンが UI に注入される', async ({ page }) => {
  await page.goto('https://www.chatwork.com/');
  // ルーム一覧の出現を待つ（DOM 構造変更検知のカナリアも兼ねる）
  await page.waitForSelector('#_sideChatMoveMyChat', { timeout: 30_000 });
  await expect(page.locator('#_openedButton')).toBeVisible({ timeout: 30_000 });
});

test('実 Chatwork で :info タグ展開が動作する（非破壊）', async ({ page }) => {
  await page.goto('https://www.chatwork.com/');
  await page.waitForSelector('#_chatText', { timeout: 30_000 });
  await page.fill('#_chatText', ':info');
  await page.focus('#_chatText');
  await page.press('#_chatText', 'Enter');
  await expect(page.locator('#_chatText')).toHaveValue('[info]\n[/info]');
  // 送信しないようクリアしておく
  await page.fill('#_chatText', '');
});
