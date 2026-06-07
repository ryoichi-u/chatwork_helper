import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = resolve(__dirname, '../.output/chrome-mv3');
const MOCK_HTML = readFileSync(resolve(__dirname, 'fixtures/chatwork-mock.html'), 'utf-8');

/** gateway.php への既読化 POST を記録するための型 */
export interface GatewayRequest {
  url: string;
  body: Record<string, string>;
}

interface Fixtures {
  context: BrowserContext;
  /** モック Chatwork を本物の URL で開いたページ + gateway 記録 */
  gatewayRequests: GatewayRequest[];
}

/**
 * Playwright で MV3 拡張をロードするフィクスチャ。
 * - launchPersistentContext + --load-extension で拡張を読み込む
 * - page.route で chatwork.com をモック HTML に差し替え（URL マッチで content script 発火）
 * - gateway.php POST もモックし、リクエストボディを記録
 */
export const test = base.extend<Fixtures>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: !process.env.HEADED,
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
    });
    await use(context);
    await context.close();
  },

  gatewayRequests: async ({ context }, use) => {
    const requests: GatewayRequest[] = [];

    // gateway.php への既読化 POST をモック + 記録
    await context.route('https://www.chatwork.com/gateway.php**', async (route) => {
      const request = route.request();
      const postData = request.postData() ?? '';
      const body = Object.fromEntries(new URLSearchParams(postData));
      requests.push({ url: request.url(), body });
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // それ以外の chatwork.com リクエストはモック HTML を本物の URL で配信
    await context.route('https://www.chatwork.com/**', async (route) => {
      if (route.request().url().includes('/gateway.php')) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_HTML,
      });
    });

    await use(requests);
  },
});

export const expect = test.expect;

/** content script のロードを待つためのユーティリティ */
export async function waitForServiceWorker(context: BrowserContext): Promise<Worker | undefined> {
  return context.serviceWorkers()[0];
}
