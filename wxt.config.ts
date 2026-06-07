import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'chatwork helper',
    homepage_url: 'https://github.com/ryoichi-u/chatwork_helper',
    author: { email: 'ryoichi-u@users.noreply.github.com' },
    // Issue #5: お気に入り・あとで読むの保存に chrome.storage.local を使用
    permissions: ['storage'],
  },
});
