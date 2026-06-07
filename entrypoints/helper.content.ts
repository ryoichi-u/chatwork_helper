import { attachAllReadButton } from '../src/allread/button';
import { findUnreadRooms } from '../src/allread/findUnreadRooms';
import { markRoomRead } from '../src/allread/markRoomRead';
import { requestCredentials } from '../src/bridge/credentials';
import { createChatworkDom } from '../src/dom/chatworkDom';
import { SELECTORS } from '../src/dom/selectors';
import { waitForElement } from '../src/dom/waitForElement';
import { initFavorites } from '../src/favorites/controller';
import { dispatchChatShortcuts, dispatchTaskShortcuts } from '../src/shortcuts/dispatcher';
import { initMentionSuggest } from '../src/suggest/controller';

/**
 * ISOLATED world で動く本体。
 * - チャット/タスク入力欄のショートカット（Enter トリガ）
 * - ルーム一覧上部の全既読ボタン
 * - お気に入り・あとで読む（Issue #5）
 * - @ メンションサジェスト（Issue #2 PoC）
 */
export default defineContentScript({
  matches: ['https://www.chatwork.com/*', 'https://kcw.kddi.ne.jp/*'],
  runAt: 'document_idle',
  async main() {
    const dom = createChatworkDom(document);

    // @ メンションサジェスト（Issue #2）。ショートカットより先に keydown を捕捉し、
    // サジェスト確定の Enter がショートカット判定へ伝播しないようにする。
    initMentionSuggest(document);

    // 入力欄は SPA 再レンダリングで差し替わる可能性があるため document へ委譲する
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Enter' || event.isComposing) return;
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        // コマンドが一致したら Enter のデフォルト動作（改行挿入・送信）を抑止する。
        // 一致しない通常入力時は何もせず Chatwork 本来の挙動に委ねる。
        let matched = false;
        if (target.matches(SELECTORS.chatText)) {
          matched = dispatchChatShortcuts(dom);
        } else if (target.matches(SELECTORS.taskNameInput)) {
          matched = dispatchTaskShortcuts(dom);
        }
        if (matched) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true,
    );

    // 全既読ボタン: 挿入先（マイチャットボタン）の出現を待って設置
    const attachTo = await waitForElement(SELECTORS.sideChatMoveMyChat);
    if (!attachTo) return; // 未ログイン等で UI が出ない場合は何もしない

    attachAllReadButton(document, () => {
      void markAllRoomsRead();
    });

    // お気に入り・あとで読む（Issue #5）
    initFavorites(document, window.location.hostname);
  },
});

/** 未読ルームをすべて既読化する */
async function markAllRoomsRead(): Promise<void> {
  try {
    const credentials = await requestCredentials();
    const rooms = findUnreadRooms(document);
    await Promise.all(
      rooms.map((room) => markRoomRead({ hostname: window.location.hostname, room, credentials })),
    );
  } catch (error) {
    console.error('[chatwork-helper] 全既読化に失敗しました:', error);
  }
}
