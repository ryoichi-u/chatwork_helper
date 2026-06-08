import { attachAllReadButton } from '../src/allread/button';
import { findUnreadRooms } from '../src/allread/findUnreadRooms';
import { markRoomRead } from '../src/allread/markRoomRead';
import { requestCredentials } from '../src/bridge/credentials';
import type { Credentials } from '../src/bridge/events';
import { createChatworkDom } from '../src/dom/chatworkDom';
import { SELECTORS } from '../src/dom/selectors';
import { waitForElement } from '../src/dom/waitForElement';
import { dispatchChatShortcuts, dispatchTaskShortcuts } from '../src/shortcuts/dispatcher';
import { initMentionSuggest } from '../src/suggest/controller';

/**
 * ISOLATED world で動く本体。
 * - チャット/タスク入力欄のショートカット（Enter トリガ）
 * - @ メンションサジェスト（Issue #2）
 * - ルーム一覧上部の全既読ボタン
 *
 * 各機能は独立して初期化し、片方の挿入先が見つからなくても他機能を止めない。
 */
export default defineContentScript({
  matches: ['https://www.chatwork.com/*', 'https://kcw.kddi.ne.jp/*'],
  runAt: 'document_idle',
  main() {
    // myid は :me/:mine フィルタ判定に使う。認証情報は非同期取得のため getter で渡し、
    // 取得完了後の最新値を参照する（ショートカット自体は即時有効）。
    let myid: string | null = null;
    const dom = createChatworkDom(document, () => myid);

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

    // 認証情報を取得して myid 確定 + 全既読ボタンを設置（取得失敗時はショートカットのみ動作）
    requestCredentials()
      .then((credentials) => {
        myid = credentials.myid;
        return setupAllReadButton(credentials);
      })
      .catch((error) => {
        console.error('[chatwork-helper] 認証情報の取得に失敗しました:', error);
      });
  },
});

/** 全既読ボタンをルーム一覧ヘッダに設置する（挿入先が出るまで待つ） */
async function setupAllReadButton(credentials: Credentials): Promise<void> {
  const attachTo = await waitForElement(SELECTORS.roomListFilterButton);
  if (!attachTo) return; // 未ログイン等で UI が出ない場合は何もしない
  attachAllReadButton(document, () => {
    void markAllRoomsRead(credentials);
  });
}

/** 未読ルームをすべて既読化する */
async function markAllRoomsRead(credentials: Credentials): Promise<void> {
  try {
    const rooms = findUnreadRooms(document);
    await Promise.all(
      rooms.map((room) => markRoomRead({ hostname: window.location.hostname, room, credentials })),
    );
  } catch (error) {
    console.error('[chatwork-helper] 全既読化に失敗しました:', error);
  }
}
