/**
 * Chatwork の DOM セレクタ定数。
 * Chatwork 側の DOM 変更時はこのファイルだけ直せば済むよう一元管理する。
 *
 * 2026-06 の新 UI（React + styled-components）に合わせ、動的クラス名ではなく
 * 安定した `data-testid` / `data-rid` / `data-mid` / `data-cwtag` / ID に寄せている。
 */
export const SELECTORS = {
  /** メッセージ入力テキストエリア（ID は新 UI でも維持されている） */
  chatText: '#_chatText',
  /** タスク名入力欄 */
  taskNameInput: '#_taskNameInput',
  /** グローバルヘッダの検索ボタン（:f の遷移先） */
  search: '[data-testid="global-header_header-search"]',
  /** TO リストを開くボタン（:to の遷移先） */
  toListButton: '[data-testid="message-input-area_to_button"]',
  /** ファイルアップロードを開くボタン（:file の遷移先） */
  fileUploadButton: '[data-testid="message-input-area_send-tool_send-file"]',
  /** タスク担当者リストを開くボタン（タスク欄の :to 用） */
  inchargeEmptyButton: '#_inchargeEmpty',
  /** 送信ボタン（E2E 用） */
  sendMessageButton: '[data-testid="timeline_send-message-button"]',

  /** ルーム一覧コンテナ */
  roomListContainer: '[data-testid="room-list_list"]',
  /** ルーム一覧の各ルーム要素（data-rid を持つ） */
  roomListItem: 'li[data-rid][role="tab"]',
  /** 全既読ボタンの挿入先（ルーム一覧ヘッダのフィルタボタン付近） */
  roomListFilterButton: '[data-testid="room-list-header_room-list-filter-button"]',
  /** ルーム要素内の未読バッジ（_unreadBadge クラス / unread-badge testid で安定） */
  unreadBadge: '._unreadBadge, [data-testid*="unread-badge" i]',

  /**
   * #2 メンションサジェストのメンバー候補要素。
   * ⚠ 新 UI では旧 `#_toList [data-account-id]` が存在しない。TO ピッカー DOM の
   * 構造が未確定のため仮置き（要実機調査）。確定するまでサジェストは候補ゼロになる。
   */
  toListMember: '[data-cwh-member][data-account-id]',

  /** タイムラインのメッセージ要素 */
  message: '._message',
  /** 送信者アバターのコンテナ（連投時の本人判定に使う） */
  messageSpeaker: '._speaker',
  /** アバター等のユーザーアイコン（data-aid に account_id） */
  userIcon: '[data-testid="user-icon"]',
} as const;

/**
 * メッセージ内の Chatwork 記法タグ（data-cwtag）を組み立てる。
 * 例: `[data-cwtag="[To:123]"]`（自分宛て TO） / `[data-cwtag="[toall]"]`（全員宛て）
 */
export const cwtagSelector = (tag: string): string => `[data-cwtag="${tag}"]`;

/** 全既読ボタンの要素 ID（旧実装から踏襲） */
export const ALL_READ_BUTTON_ID = '_openedButton';
