import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = resolve(__dirname, '../playwright/.auth');
const AUTH_FILE = resolve(AUTH_DIR, 'chatwork.json');

/**
 * 実 Chatwork スモークテスト用の認証セットアップ（ローカル専用・CI 非対象）。
 *
 * 実行: `npm run smoke:auth`
 * ブラウザが開くので手動でログイン → ルーム一覧が表示されたら Enter を押す。
 * storageState が playwright/.auth/chatwork.json に保存される（.gitignore 済み）。
 *
 * セキュリティ: このファイルは認証 Cookie を保存する。公開リポジトリのため
 * 保存先は必ず .gitignore に含めること。
 */
async function main() {
  mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: 'chromium', headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.chatwork.com/login.php');
  console.log('\n=== Chatwork に手動でログインしてください ===');
  console.log('ルーム一覧が表示されたら、このターミナルで Enter を押してください。\n');

  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  await context.storageState({ path: AUTH_FILE });
  console.log(`\n認証情報を保存しました: ${AUTH_FILE}`);
  await browser.close();
  process.exit(0);
}

void main();
