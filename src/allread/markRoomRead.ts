import type { Credentials } from '../bridge/events';
import type { UnreadRoom } from './findUnreadRooms';

export interface MarkRoomReadParams {
  hostname: string;
  room: UnreadRoom;
  credentials: Credentials;
}

/**
 * Chatwork の gateway.php へ既読化リクエストを送る。
 * 旧実装の `$.post` を fetch + URLSearchParams（同一オリジン・Cookie 付与）に置換。
 */
export async function markRoomRead({
  hostname,
  room,
  credentials,
}: MarkRoomReadParams): Promise<void> {
  const query = new URLSearchParams({
    cmd: 'read',
    myid: credentials.myid,
    _v: credentials.clientVer,
    _av: '5',
    ln: credentials.language,
  });
  const body = new URLSearchParams({
    room_id: room.roomId,
    unread: '0',
    ...(room.lastChatId !== undefined ? { last_chat_id: room.lastChatId } : {}),
    _t: credentials.accessToken,
  });

  const response = await fetch(`https://${hostname}/gateway.php?${query}`, {
    method: 'POST',
    body,
    credentials: 'include',
  });
  if (!response.ok) {
    // ACCESS_TOKEN 等の秘密情報はログに出さない
    throw new Error(`markRoomRead failed: HTTP ${response.status} (room_id=${room.roomId})`);
  }
}
