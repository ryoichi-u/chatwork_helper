import { describe, expect, it } from 'vitest';
import { findUnreadRooms } from './findUnreadRooms';

describe('findUnreadRooms', () => {
  it('未読バッジ付きルームのみ抽出する', () => {
    document.body.innerHTML = `
      <ul>
        <li class="roomListItem" data-rid="100">
          <p class="roomListItem__roomName--unread">未読ルーム</p>
        </li>
        <li class="roomListItem" data-rid="200">
          <p class="roomListItem__roomName">既読ルーム</p>
        </li>
        <li class="roomListItem" data-rid="300">
          <p class="roomListItem__roomName--unread">未読ルーム2</p>
        </li>
      </ul>
    `;
    expect(findUnreadRooms(document)).toEqual([
      { roomId: '100', lastChatId: undefined },
      { roomId: '300', lastChatId: undefined },
    ]);
  });

  it('DOM 上にメッセージがあれば最終メッセージ ID を拾う', () => {
    document.body.innerHTML = `
      <li class="roomListItem" data-rid="100">
        <p class="roomListItem__roomName--unread">未読ルーム</p>
      </li>
      <div class="_message" data-rid="100" data-mid="m-1"></div>
      <div class="_message" data-rid="100" data-mid="m-2"></div>
      <div class="_message" data-rid="999" data-mid="other"></div>
    `;
    expect(findUnreadRooms(document)).toEqual([{ roomId: '100', lastChatId: 'm-2' }]);
  });

  it('未読ルームがなければ空配列', () => {
    document.body.innerHTML = `
      <li class="roomListItem" data-rid="200">
        <p class="roomListItem__roomName">既読ルーム</p>
      </li>
    `;
    expect(findUnreadRooms(document)).toEqual([]);
  });
});
