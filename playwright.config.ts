import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // 拡張のロードに persistent context を使うため並列実行は避ける
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'e2e',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.smoke\.spec\.ts/,
    },
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.ts/,
    },
  ],
});
