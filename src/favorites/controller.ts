import { SELECTORS } from '../dom/selectors';
import { extractFavoriteData } from './extract';
import { jumpToMessage } from './jump';
import { ensureSaveButton, ensureSaveButtonStyle, setButtonSavedState } from './messageButton';
import { ensurePanelStyle, PANEL_ID, PANEL_TOGGLE_ID, renderFavoritesPanel } from './panel';
import {
  addFavorite,
  getFavorites,
  isFavorited,
  onFavoritesChanged,
  removeFavorite,
} from './storage';

/** 現在時刻を返す（テストで差し替え可能にするため注入可能） */
export type NowFn = () => number;

/**
 * お気に入り機能を初期化する（Issue #5）。
 * - メッセージホバーに「あとで読む」ボタンを付与
 * - ルーム一覧ヘッダにパネル開閉ボタンを設置
 * - storage 変更を購読してパネルとボタン状態をライブ更新
 */
export function initFavorites(doc: Document, hostname: string, now: NowFn = Date.now): void {
  ensureSaveButtonStyle(doc);
  ensurePanelStyle(doc);

  // 「あとで読む」ボタンをホバー時に遅延付与（イベント委譲）
  doc.addEventListener(
    'mouseover',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const messageEl = target.closest<HTMLElement>(SELECTORS.message);
      if (!messageEl) return;
      const button = ensureSaveButton(doc, messageEl, handleSaveClick);
      if (!button) return;
      const mid = messageEl.dataset.mid;
      if (mid) void isFavorited(mid).then((saved) => setButtonSavedState(button, saved));
    },
    true,
  );

  attachToggleButton(doc);

  // storage 変更でパネルが開いていれば再描画
  onFavoritesChanged(() => {
    if (doc.getElementById(PANEL_ID)) void openPanel(doc, hostname);
  });

  async function handleSaveClick(messageEl: HTMLElement, button: HTMLButtonElement): Promise<void> {
    const data = extractFavoriteData(messageEl);
    if (!data) return;
    if (await isFavorited(data.mid)) {
      await removeFavorite(data.mid);
      setButtonSavedState(button, false);
    } else {
      await addFavorite({ ...data, savedAt: now() });
      setButtonSavedState(button, true);
    }
  }
}

/** ルーム一覧ヘッダにパネル開閉ボタンを設置する */
function attachToggleButton(doc: Document): HTMLButtonElement | null {
  doc.getElementById(PANEL_TOGGLE_ID)?.remove();
  const anchor = doc.querySelector(SELECTORS.sideChatMoveMyChat);
  if (!anchor) return null;

  const toggle = doc.createElement('button');
  toggle.id = PANEL_TOGGLE_ID;
  toggle.type = 'button';
  toggle.className = 'roomListHeader__myChatButton';
  toggle.setAttribute('aria-label', 'あとで読む一覧');
  toggle.textContent = '★';
  toggle.addEventListener('click', () => {
    if (doc.getElementById(PANEL_ID)) {
      closePanel(doc);
    } else {
      void openPanel(doc, doc.defaultView?.location.hostname ?? 'www.chatwork.com');
    }
  });
  anchor.after(toggle);
  return toggle;
}

/** パネルを開く（または再描画する） */
async function openPanel(doc: Document, hostname: string): Promise<void> {
  const favorites = await getFavorites();
  const panel = renderFavoritesPanel(doc, favorites, {
    onJump: (favorite) => {
      jumpToMessage(doc, favorite, hostname);
      closePanel(doc);
    },
    onRemove: (favorite) => {
      void removeFavorite(favorite.mid);
    },
    onClose: () => closePanel(doc),
  });
  doc.body.appendChild(panel);
}

/** パネルを閉じる */
function closePanel(doc: Document): void {
  doc.getElementById(PANEL_ID)?.remove();
}
