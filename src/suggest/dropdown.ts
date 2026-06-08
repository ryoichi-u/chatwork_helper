import type { RoomMember } from './toTag';

export const DROPDOWN_ID = 'cwh-mention-dropdown';
export const DROPDOWN_STYLE_ID = 'cwh-mention-style';
export const ACTIVE_ITEM_CLASS = 'cwh-mention-active';

const STYLE_TEXT = `
#${DROPDOWN_ID} {
  position: fixed;
  z-index: 2147483647;
  min-width: 200px;
  max-height: 260px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-size: 13px;
}
#${DROPDOWN_ID} .cwh-mention-item {
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
}
#${DROPDOWN_ID} .cwh-mention-item.${ACTIVE_ITEM_CLASS},
#${DROPDOWN_ID} .cwh-mention-item:hover {
  background: #e8f0fe;
}
#${DROPDOWN_ID} .cwh-mention-id {
  color: #999;
  font-size: 11px;
  margin-left: 6px;
}
`;

function ensureStyle(doc: Document): void {
  if (doc.getElementById(DROPDOWN_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = DROPDOWN_STYLE_ID;
  style.textContent = STYLE_TEXT;
  (doc.head ?? doc.documentElement).appendChild(style);
}

/** ドロップダウンの表示位置（入力欄の矩形を基準に配置する） */
export interface DropdownAnchor {
  left: number;
  /** 入力欄の下端（ここを基準にドロップダウンを下に出す） */
  bottom: number;
  /** 入力欄の上端（下に出すと画面外になる場合に上へ出すため） */
  top: number;
}

/** サジェストのドロップダウンを構築/更新する（DOM API のみ・innerHTML 不使用） */
export function renderDropdown(
  doc: Document,
  members: RoomMember[],
  activeIndex: number,
  onSelect: (member: RoomMember) => void,
  anchor?: DropdownAnchor,
): HTMLDivElement {
  ensureStyle(doc);
  doc.getElementById(DROPDOWN_ID)?.remove();

  const dropdown = doc.createElement('div');
  dropdown.id = DROPDOWN_ID;

  // 入力欄の矩形を基準に位置を決める（review #2: 既定の左上固定を解消）
  if (anchor) {
    const view = doc.defaultView;
    const viewportH = view?.innerHeight ?? 0;
    dropdown.style.left = `${Math.round(anchor.left)}px`;
    // 入力欄の下に十分な余白がなければ上側に出す
    if (viewportH && anchor.bottom > viewportH - 120) {
      dropdown.style.bottom = `${Math.round(viewportH - anchor.top)}px`;
    } else {
      dropdown.style.top = `${Math.round(anchor.bottom)}px`;
    }
  }

  members.forEach((member, index) => {
    const item = doc.createElement('div');
    item.className = 'cwh-mention-item';
    if (index === activeIndex) item.classList.add(ACTIVE_ITEM_CLASS);
    item.dataset.accountId = member.accountId;

    const name = doc.createElement('span');
    name.textContent = member.name;
    const id = doc.createElement('span');
    id.className = 'cwh-mention-id';
    id.textContent = `#${member.accountId}`;
    item.append(name, id);

    // mousedown で選択（blur より先に発火させ、入力欄のフォーカスを維持）
    item.addEventListener('mousedown', (event) => {
      event.preventDefault();
      onSelect(member);
    });
    dropdown.appendChild(item);
  });

  doc.body.appendChild(dropdown);
  return dropdown;
}

/** ドロップダウンを閉じる */
export function closeDropdown(doc: Document): void {
  doc.getElementById(DROPDOWN_ID)?.remove();
}

/** ドロップダウンが開いているか */
export function isDropdownOpen(doc: Document): boolean {
  return doc.getElementById(DROPDOWN_ID) !== null;
}
