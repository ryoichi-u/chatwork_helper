import { SELECTORS } from '../dom/selectors';

export const SAVE_BUTTON_CLASS = 'cwh-fav-save';
export const SAVE_BUTTON_STYLE_ID = 'cwh-fav-save-style';

const STYLE_TEXT = `
${SELECTORS.message} { position: relative; }
.${SAVE_BUTTON_CLASS} {
  position: absolute;
  top: 4px;
  right: 4px;
  cursor: pointer;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
  font-size: 11px;
  padding: 2px 6px;
  opacity: 0;
  transition: opacity 0.1s;
}
${SELECTORS.message}:hover .${SAVE_BUTTON_CLASS} {
  opacity: 1;
}
.${SAVE_BUTTON_CLASS}.cwh-fav-saved {
  background: #f0ad4e;
  color: #fff;
  border-color: #f0ad4e;
}
`;

/** 「あとで読む」ボタン用スタイルを一度だけ注入する */
export function ensureSaveButtonStyle(doc: Document): void {
  if (doc.getElementById(SAVE_BUTTON_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = SAVE_BUTTON_STYLE_ID;
  style.textContent = STYLE_TEXT;
  (doc.head ?? doc.documentElement).appendChild(style);
}

/** メッセージ要素に「あとで読む」ボタンを 1 つだけ生成して付与する */
export function ensureSaveButton(
  doc: Document,
  messageEl: HTMLElement,
  onClick: (messageEl: HTMLElement, button: HTMLButtonElement) => void,
): HTMLButtonElement | null {
  const existing = messageEl.querySelector<HTMLButtonElement>(`.${SAVE_BUTTON_CLASS}`);
  if (existing) return existing;

  const button = doc.createElement('button');
  button.type = 'button';
  button.className = SAVE_BUTTON_CLASS;
  button.textContent = '★ あとで読む';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick(messageEl, button);
  });
  messageEl.appendChild(button);
  return button;
}

/** 保存済み状態をボタンに反映する */
export function setButtonSavedState(button: HTMLButtonElement, saved: boolean): void {
  button.classList.toggle('cwh-fav-saved', saved);
  button.textContent = saved ? '★ 保存済み' : '★ あとで読む';
}
