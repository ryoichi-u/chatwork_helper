import { describe, expect, it } from 'vitest';
import { findUnreadRooms } from './findUnreadRooms';

// 未読バッジは実機調査で確定: li._unreadBadge（data-testid="unread-badge-*"）。

describe('findUnreadRooms', () => {
  it('未読ルームのみ抽出する', () => {
    document.body.innerHTML = `
      <ul>
        <li data-rid="100" role="tab"><span class="_unreadBadge">3</span></li>
        <li data-rid="200" role="tab"></li>
        <li data-rid="300" role="tab"><span class="_unreadBadge">1</span></li>
      </ul>
    `;
    expect(findUnreadRooms(document)).toEqual([
      { roomId: '100', lastChatId: undefined },
      { roomId: '300', lastChatId: undefined },
    ]);
  });

  it('DOM 上にメッセージがあれば最終メッセージ ID を拾う', () => {
    document.body.innerHTML = `
      <li data-rid="100" role="tab"><span class="_unreadBadge">1</span></li>
      <div class="_message" data-rid="100" data-mid="m-1"></div>
      <div class="_message" data-rid="100" data-mid="m-2"></div>
      <div class="_message" data-rid="999" data-mid="other"></div>
    `;
    expect(findUnreadRooms(document)).toEqual([{ roomId: '100', lastChatId: 'm-2' }]);
  });

  it('未読ルームがなければ空配列', () => {
    document.body.innerHTML = `
      <li data-rid="200" role="tab"></li>
    `;
    expect(findUnreadRooms(document)).toEqual([]);
  });
});
