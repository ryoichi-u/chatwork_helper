/** メッセージ表示フィルタのモード */
export type FilterMode = 'me' | 'mine' | 'all';

/**
 * ショートカットが触る Chatwork DOM の薄い抽象。
 * ロジック（純粋関数）と DOM 副作用を分離し、Vitest でテスト可能にする。
 */
export interface ChatworkDom {
  getChatText(): string;
  setChatText(value: string): void;
  focusChatText(): void;
  getTaskText(): string;
  setTaskText(value: string): void;
  focusTaskInput(): void;
  openToList(): void;
  openFileUpload(): void;
  openAssigneeList(): void;
  focusSearch(): void;
  filterMessages(mode: FilterMode): void;
}

/** チャット入力欄で発火するショートカット定義 */
export interface Shortcut {
  /** トリガの正規表現ソース。実際の判定は (^|\n)key($|\n) で行末/行頭一致 */
  key: string;
  run(dom: ChatworkDom): void;
}
