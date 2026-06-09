import { SELECTORS } from '../dom/selectors';
import type { RoomMember } from './toTag';

/**
 * ルームメンバー一覧を DOM から読み取る（Issue #2）。
 *
 * 新 UI（2026-06）ではルームヘッダにメンバーアバターが並ぶ。各アバターは
 * `[data-source="timeline_room_member_profile"]` で、`data-aid` に account_id、
 * 子 `img` の `alt` に表示名を持つ（実機調査で確定）。
 */
export function readRoomMembers(root: ParentNode): RoomMember[] {
  const members: RoomMember[] = [];
  const seen = new Set<string>();

  for (const el of root.querySelectorAll<HTMLElement>(SELECTORS.roomMemberIcon)) {
    const accountId = el.dataset.aid;
    if (!accountId || seen.has(accountId)) continue;

    // 名前はアバター img の alt → 要素テキストの順で取得
    const img = el.querySelector('img');
    const name = (img?.getAttribute('alt') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!name) continue;

    seen.add(accountId);
    members.push({ accountId, name });
  }
  return members;
}
