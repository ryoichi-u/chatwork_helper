import { describe, expect, it } from 'vitest';
import { readRoomMembers } from './members';

describe('readRoomMembers', () => {
  it('TO リスト DOM からメンバーを読み取る', () => {
    document.body.innerHTML = `
      <div id="_toList">
        <li data-account-id="111"><span class="toList__name">山田太郎</span></li>
        <li data-account-id="222"><span class="toList__name">佐藤花子</span></li>
      </div>
    `;
    expect(readRoomMembers(document)).toEqual([
      { accountId: '111', name: '山田太郎' },
      { accountId: '222', name: '佐藤花子' },
    ]);
  });

  it('名前要素が無ければ要素テキストで補完する', () => {
    document.body.innerHTML = `
      <div id="_toList"><li data-account-id="111"> 山田太郎 </li></div>
    `;
    expect(readRoomMembers(document)).toEqual([{ accountId: '111', name: '山田太郎' }]);
  });

  it('account-id 重複は除外する', () => {
    document.body.innerHTML = `
      <div id="_toList">
        <li data-account-id="111">山田</li>
        <li data-account-id="111">山田（重複）</li>
      </div>
    `;
    expect(readRoomMembers(document)).toHaveLength(1);
  });

  it('TO リストが無ければ空配列', () => {
    document.body.innerHTML = '';
    expect(readRoomMembers(document)).toEqual([]);
  });
});
