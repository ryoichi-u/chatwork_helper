/**
 * Chatwork の DOM セレクタ定数。
 * Chatwork 側の DOM 変更時はこのファイルだけ直せば済むよう一元管理する。
 */
export const SELECTORS = {
  /** メッセージ入力テキストエリア */
  chatText: '#_chatText',
  /** タスク名入力欄 */
  taskNameInput: '#_taskNameInput',
  /** 検索ボックス */
  search: '#_search',
  /** TO リストを開くボタン */
  toListButton: '#_to',
  /** ファイルアップロードを開くボタン */
  fileUploadButton: '#_file',
  /** タスク担当者リストを開くボタン */
  inchargeEmptyButton: '#_inchargeEmpty',
  /** 全既読ボタンの挿入先（マイチャットボタン） */
  sideChatMoveMyChat: '#_sideChatMoveMyChat',
  /** タイムラインのメッセージ要素 */
  message: '._message',
  /** ルーム一覧のルーム要素 */
  roomListItem: 'li.roomListItem',
  /** 未読ルーム名（未読バッジ付き） */
  unreadRoomName: 'p.roomListItem__roomName--unread',
} as const;

/** メッセージ要素に付く状態クラス */
export const MESSAGE_CLASSES = {
  /** 自分宛て TO/メンション */
  mention: 'chatTimeLineMessageMention',
  /** 自分の送信メッセージ */
  mine: 'chatTimeLineMessageMine',
} as const;

/** 全既読ボタンの要素 ID（旧実装から踏襲） */
export const ALL_READ_BUTTON_ID = '_openedButton';
