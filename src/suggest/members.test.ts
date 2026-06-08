import { describe, expect, it } from 'vitest';
import { readRoomMembers } from './members';

// 注: メンバー候補の取得元（TO ピッカー DOM）は新 UI では未確定（要実機調査）。
// SELECTORS.toListMember は仮セレクタ [data-cwh-member][data-account-id]。
// ここではその仮セレクタに合わせたモックで readRoomMembers のロジックを検証する。

describe('readRoomMembers', () => {
  it('メンバー候補 DOM からメンバーを読み取る', () => {
    document.body.innerHTML = `
      <li data-cwh-member data-account-id="111"><span class="toList__name">山田太郎</span></li>
      <li data-cwh-member data-account-id="222"><span class="toList__name">佐藤花子</span></li>
    `;
    expect(readRoomMembers(document)).toEqual([
      { accountId: '111', name: '山田太郎' },
      { accountId: '222', name: '佐藤花子' },
    ]);
  });

  it('名前要素が無ければ要素テキストで補完する', () => {
    document.body.innerHTML = `
      <li data-cwh-member data-account-id="111"> 山田太郎 </li>
    `;
    expect(readRoomMembers(document)).toEqual([{ accountId: '111', name: '山田太郎' }]);
  });

  it('account-id 重複は除外する', () => {
    document.body.innerHTML = `
      <li data-cwh-member data-account-id="111">山田</li>
      <li data-cwh-member data-account-id="111">山田（重複）</li>
    `;
    expect(readRoomMembers(document)).toHaveLength(1);
  });

  it('候補が無ければ空配列', () => {
    document.body.innerHTML = '';
    expect(readRoomMembers(document)).toEqual([]);
  });
});
