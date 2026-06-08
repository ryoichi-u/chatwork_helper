import { SELECTORS } from '../dom/selectors';

export interface UnreadRoom {
  roomId: string;
  /** DOM に読み込まれている当該ルームの最終メッセージ ID（未ロードなら undefined） */
  lastChatId?: string;
}

/**
 * ルーム一覧から未読ルームを走査する。
 *
 * 新 UI（2026-06）の未読バッジは `li._unreadBadge`（data-testid="unread-badge-*"）。
 * 実機調査で確定済み。
 */
export function findUnreadRooms(root: ParentNode): UnreadRoom[] {
  const rooms: UnreadRoom[] = [];
  for (const item of root.querySelectorAll<HTMLElement>(SELECTORS.roomListItem)) {
    if (!isUnreadRoom(item)) continue;
    const roomId = item.dataset.rid;
    if (!roomId) continue;

    const messages = root.querySelectorAll<HTMLElement>(
      `${SELECTORS.message}[data-rid="${CSS.escape(roomId)}"]`,
    );
    const last = messages[messages.length - 1];
    rooms.push({ roomId, lastChatId: last?.dataset.mid });
  }
  return rooms;
}

/** ルーム要素が未読かどうか判定する（未読バッジ要素の有無） */
export function isUnreadRoom(item: HTMLElement): boolean {
  return item.querySelector(SELECTORS.unreadBadge) !== null;
}
