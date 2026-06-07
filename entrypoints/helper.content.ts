export default defineContentScript({
  matches: ['https://www.chatwork.com/*', 'https://kcw.kddi.ne.jp/*'],
  main() {
    // Phase 2 で chatworkHelper.js のロジックを移植する。
    // Phase 1 (scaffold) ではビルド・ロード確認用のスタブのみ。
    console.debug('[chatwork-helper] content script loaded (v3 scaffold)');
  },
});
