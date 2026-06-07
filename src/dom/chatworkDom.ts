import { applyMessageFilter } from '../shortcuts/messageFilter';
import type { ChatworkDom, FilterMode } from '../shortcuts/types';
import { SELECTORS } from './selectors';

/** document を背後に持つ ChatworkDom の実装 */
export function createChatworkDom(doc: Document): ChatworkDom {
  const query = <T extends HTMLElement>(selector: string): T | null =>
    doc.querySelector<T>(selector);

  const chatText = () => query<HTMLTextAreaElement>(SELECTORS.chatText);
  const taskInput = () => query<HTMLTextAreaElement>(SELECTORS.taskNameInput);

  return {
    getChatText: () => chatText()?.value ?? '',
    setChatText(value: string) {
      const el = chatText();
      if (el) el.value = value;
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
    filterMessages: (mode: FilterMode) => applyMessageFilter(doc, mode),
  };
}
