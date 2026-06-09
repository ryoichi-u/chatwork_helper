import { describe, expect, it } from 'vitest';
import { readRoomMembers } from './members';

// メンバー取得元は実機調査で確定:
// ルームヘッダのアバター [data-source="timeline_room_member_profile"]
// （data-aid=account_id、子 img の alt=名前）。

describe('readRoomMembers', () => {
  it('ルームメンバーのアバターから account_id と名前を読み取る', () => {
    document.body.innerHTML = `
      <div data-source="timeline_room_member_profile" data-aid="111"><img alt="山田太郎" /></div>
      <div data-source="timeline_room_member_profile" data-aid="222"><img alt="佐藤花子" /></div>
    `;
    expect(readRoomMembers(document)).toEqual([
      { accountId: '111', name: '山田太郎' },
      { accountId: '222', name: '佐藤花子' },
    ]);
  });

  it('img が無ければ要素テキストで補完する', () => {
    document.body.innerHTML = `
      <div data-source="timeline_room_member_profile" data-aid="111"> 山田太郎 </div>
    `;
    expect(readRoomMembers(document)).toEqual([{ accountId: '111', name: '山田太郎' }]);
  });

  it('account-id 重複は除外する', () => {
    document.body.innerHTML = `
      <div data-source="timeline_room_member_profile" data-aid="111"><img alt="山田" /></div>
      <div data-source="timeline_room_member_profile" data-aid="111"><img alt="山田（重複）" /></div>
    `;
    expect(readRoomMembers(document)).toHaveLength(1);
  });

  it('メンバーが無ければ空配列', () => {
    document.body.innerHTML = '';
    expect(readRoomMembers(document)).toEqual([]);
  });
});
