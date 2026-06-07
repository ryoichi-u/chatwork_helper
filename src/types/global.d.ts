export {};

declare global {
  /**
   * Chatwork のページグローバル変数（MAIN world でのみ参照可能）。
   * page-bridge.content.ts が読み取り、CustomEvent で ISOLATED 側へ渡す。
   */
  interface Window {
    MYID?: string;
    ACCESS_TOKEN?: string;
    CLIENT_VER?: string;
    LANGUAGE?: string;
  }
}
