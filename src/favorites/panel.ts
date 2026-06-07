import type { Favorite } from './types';

export const PANEL_ID = 'cwh-favorites-panel';
export const PANEL_TOGGLE_ID = 'cwh-favorites-toggle';
export const PANEL_STYLE_ID = 'cwh-favorites-style';

const STYLE_TEXT = `
#${PANEL_TOGGLE_ID} {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
#${PANEL_ID} {
  position: fixed;
  top: 48px;
  left: 16px;
  width: 320px;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 2147483647;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-size: 13px;
}
#${PANEL_ID} .cwh-fav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}
#${PANEL_ID} .cwh-fav-empty {
  padding: 16px 12px;
  color: #888;
}
#${PANEL_ID} .cwh-fav-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #f2f2f2;
}
#${PANEL_ID} .cwh-fav-text {
  flex: 1;
  cursor: pointer;
  word-break: break-all;
}
#${PANEL_ID} .cwh-fav-text:hover {
  color: #1976d2;
}
#${PANEL_ID} button {
  cursor: pointer;
  border: none;
  background: transparent;
  color: #888;
  font-size: 14px;
  line-height: 1;
}
`;

/** パネル用スタイルシートを一度だけ注入する */
export function ensurePanelStyle(doc: Document): void {
  if (doc.getElementById(PANEL_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = PANEL_STYLE_ID;
  style.textContent = STYLE_TEXT;
  (doc.head ?? doc.documentElement).appendChild(style);
}

export interface PanelHandlers {
  onJump(favorite: Favorite): void;
  onRemove(favorite: Favorite): void;
  onClose(): void;
}

/**
 * お気に入り一覧パネルを DOM API のみで構築する（innerHTML 不使用）。
 * 既存パネルがあれば置き換える。
 */
export function renderFavoritesPanel(
  doc: Document,
  favorites: Favorite[],
  handlers: PanelHandlers,
): HTMLDivElement {
  doc.getElementById(PANEL_ID)?.remove();

  const panel = doc.createElement('div');
  panel.id = PANEL_ID;

  const header = doc.createElement('div');
  header.className = 'cwh-fav-header';
  const title = doc.createElement('span');
  title.textContent = `あとで読む (${favorites.length})`;
  const closeButton = doc.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '閉じる');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => handlers.onClose());
  header.append(title, closeButton);
  panel.appendChild(header);

  if (favorites.length === 0) {
    const empty = doc.createElement('div');
    empty.className = 'cwh-fav-empty';
    empty.textContent = '保存されたメッセージはありません';
    panel.appendChild(empty);
    return panel;
  }

  for (const favorite of favorites) {
    const item = doc.createElement('div');
    item.className = 'cwh-fav-item';
    item.dataset.mid = favorite.mid;

    const text = doc.createElement('div');
    text.className = 'cwh-fav-text';
    text.textContent = favorite.text || '(本文なし)';
    text.setAttribute('role', 'button');
    text.addEventListener('click', () => handlers.onJump(favorite));

    const removeButton = doc.createElement('button');
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', '削除');
    removeButton.textContent = '🗑';
    removeButton.addEventListener('click', () => handlers.onRemove(favorite));

    item.append(text, removeButton);
    panel.appendChild(item);
  }

  return panel;
}
