import { SELECTORS } from '../dom/selectors';

export interface UnreadRoom {
  roomId: string;
  /** DOM に読み込まれている当該ルームの最終メッセージ ID（未ロードなら undefined） */
  lastChatId?: string;
}

/** ルーム一覧から未読バッジ付きルームを走査する */
export function findUnreadRooms(root: ParentNode): UnreadRoom[] {
  const rooms: UnreadRoom[] = [];
  for (const item of root.querySelectorAll<HTMLElement>(SELECTORS.roomListItem)) {
    if (!item.querySelector(SELECTORS.unreadRoomName)) continue;
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
