import { applyMessageFilter } from '../shortcuts/messageFilter';
import type { ChatworkDom, FilterMode } from '../shortcuts/types';
import { SELECTORS } from './selectors';

/**
 * document を背後に持つ ChatworkDom の実装。
 * getMyid は自分の account_id を返す getter。メッセージフィルタ（:me/:mine）の判定に使う。
 * 認証情報は非同期取得のため getter にし、取得完了後の最新値を毎回参照する。
 * 未取得（null）の間はフィルタが無効化される。
 */
export function createChatworkDom(
  doc: Document,
  getMyid: () => string | null = () => null,
): ChatworkDom {
  const query = <T extends HTMLElement>(selector: string): T | null =>
    doc.querySelector<T>(selector);

  const chatText = () => query<HTMLTextAreaElement>(SELECTORS.chatText);
  const taskInput = () => query<HTMLTextAreaElement>(SELECTORS.taskNameInput);

  return {
    getChatText: () => chatText()?.value ?? '',
    getChatCursor: () => chatText()?.selectionStart ?? 0,
    setChatText(value: string, cursor?: number) {
      const el = chatText();
      if (!el) return;
      el.value = value;
      if (cursor !== undefined) {
        const pos = Math.max(0, Math.min(cursor, value.length));
        el.setSelectionRange(pos, pos);
      }
    },
    focusChatText: () => chatText()?.focus(),
    getTaskText: () => taskInput()?.value ?? '',
    setTaskText(value: string) {
      const el = taskInput();
      if (el) el.value = value;
    },
    focusTaskInput: () => taskInput()?.focus(),
    openToList: () => query(SELECTORS.toListButton)?.click(),
    openFileUpload: () => query(SELECTORS.fileUploadButton)?.click(),
    openAssigneeList: () => query(SELECTORS.inchargeEmptyButton)?.click(),
    focusSearch: () => query(SELECTORS.search)?.focus(),
    filterMessages: (mode: FilterMode) => applyMessageFilter(doc, mode, getMyid()),
  };
}
