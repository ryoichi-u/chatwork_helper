import { SELECTORS } from '../dom/selectors';
import type { RoomMember } from './toTag';

/**
 * TO リスト DOM からルームメンバー一覧を読み取る（Issue #2）。
 *
 * ⚠ PoC: セレクタ・属性名は実 Chatwork の DOM に合わせてスモーク検証が必要。
 * 各メンバー要素から `data-account-id` とメンバー名テキストを取り出す。
 */
export function readRoomMembers(root: ParentNode): RoomMember[] {
  const members: RoomMember[] = [];
  const seen = new Set<string>();

  for (const el of root.querySelectorAll<HTMLElement>(SELECTORS.toListMember)) {
    const accountId = el.dataset.accountId;
    if (!accountId || seen.has(accountId)) continue;

    // 名前は専用要素 → なければ要素テキストの順で取得
    const nameEl = el.querySelector<HTMLElement>('[class*="name" i]');
    const name = (nameEl?.textContent ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!name) continue;

    seen.add(accountId);
    members.push({ accountId, name });
  }
  return members;
}
