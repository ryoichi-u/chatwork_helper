import { SELECTORS } from '../dom/selectors';
import { closeDropdown, isDropdownOpen, renderDropdown } from './dropdown';
import { readRoomMembers } from './members';
import { applyMention, filterMembers, findMentionToken, type RoomMember } from './toTag';

/**
 * @ サジェスト機能を初期化する（Issue #2 PoC）。
 *
 * 設計: 本家 JS のメンバー選択処理を介さず、`@クエリ` を検出して独自ドロップダウンを
 * 表示し、選択時に TO タグ記法 `[To:id] 名前さん` をテキストとして挿入する。
 */
export function initMentionSuggest(doc: Document): void {
  let candidates: RoomMember[] = [];
  let activeIndex = 0;

  const chatText = () => doc.querySelector<HTMLTextAreaElement>(SELECTORS.chatText);

  /** 入力欄の矩形を基準にドロップダウンを描画する（位置指定込み・review #2） */
  function paint(): void {
    const el = chatText();
    const rect = el?.getBoundingClientRect();
    renderDropdown(
      doc,
      candidates,
      activeIndex,
      (member) => select(member),
      rect ? { left: rect.left, bottom: rect.bottom, top: rect.top } : undefined,
    );
  }

  function refresh(): void {
    const el = chatText();
    if (!el) return;
    const token = findMentionToken(el.value, el.selectionStart ?? el.value.length);
    if (!token) {
      close();
      return;
    }
    const members = readRoomMembers(doc);
    candidates = filterMembers(members, token.query);
    if (candidates.length === 0) {
      close();
      return;
    }
    activeIndex = 0;
    paint();
  }

  function select(member: RoomMember): void {
    const el = chatText();
    if (!el) return;
    const cursor = el.selectionStart ?? el.value.length;
    const token = findMentionToken(el.value, cursor);
    if (!token) return;
    const result = applyMention(el.value, token, member, cursor);
    el.value = result.text;
    el.setSelectionRange(result.cursor, result.cursor);
    el.focus();
    close();
  }

  function close(): void {
    candidates = [];
    activeIndex = 0;
    closeDropdown(doc);
  }

  // 入力でサジェストを更新
  doc.addEventListener('input', (event) => {
    if (event.target instanceof HTMLElement && event.target.matches(SELECTORS.chatText)) {
      refresh();
    }
  });

  // キーボード操作（↑↓ で選択、Enter/Tab で確定、Esc で閉じる）
  doc.addEventListener(
    'keydown',
    (event) => {
      if (!isDropdownOpen(doc)) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(SELECTORS.chatText)) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          activeIndex = (activeIndex + 1) % candidates.length;
          paint();
          break;
        case 'ArrowUp':
          event.preventDefault();
          activeIndex = (activeIndex - 1 + candidates.length) % candidates.length;
          paint();
          break;
        case 'Enter':
        case 'Tab': {
          const member = candidates[activeIndex];
          if (member) {
            event.preventDefault();
            // 後続のショートカット keydown ハンドラへ伝播させない
            event.stopImmediatePropagation();
            select(member);
          }
          break;
        }
        case 'Escape':
          event.preventDefault();
          close();
          break;
      }
    },
    true,
  );

  // フォーカスが外れたら閉じる
  doc.addEventListener('focusout', (event) => {
    if (event.target instanceof HTMLElement && event.target.matches(SELECTORS.chatText)) {
      close();
    }
  });
}
