import { CREDENTIALS_REQUEST_EVENT, CREDENTIALS_RESPONSE_EVENT } from '../src/bridge/events';

/**
 * MAIN world で動くブリッジ（Issue #30 の根本解決）。
 * ページグローバル変数（MYID / ACCESS_TOKEN / CLIENT_VER / LANGUAGE）を読み、
 * ISOLATED world（helper.content.ts）からの要求に CustomEvent で応答する。
 *
 * セキュリティノート: ここで扱う値はすべて元々ページの window 直下にあり、
 * ページ上のあらゆるスクリプトが既に読める。応答イベントを聴けば第三者
 * スクリプトも値を得られるが、window.ACCESS_TOKEN を直接読むのと等価であり、
 * このブリッジによって新たに露出する情報はない。
 */
export default defineContentScript({
  matches: ['https://www.chatwork.com/*', 'https://kcw.kddi.ne.jp/*'],
  world: 'MAIN',
  runAt: 'document_idle',
  main() {
    window.addEventListener(CREDENTIALS_REQUEST_EVENT, () => {
      // ページ変数が未初期化の段階では accessToken が空になり、
      // ISOLATED 側の parseCredentials が弾いて再要求する。
      const detail = JSON.stringify({
        myid: window.MYID ?? '',
        accessToken: window.ACCESS_TOKEN ?? '',
        clientVer: String(window.CLIENT_VER ?? ''),
        language: window.LANGUAGE ?? 'ja',
      });
      window.dispatchEvent(new CustomEvent(CREDENTIALS_RESPONSE_EVENT, { detail }));
    });
  },
});
