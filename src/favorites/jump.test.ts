import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildMessagePermalink, jumpToMessage } from './jump';
import type { Favorite } from './types';

const favorite: Favorite = { mid: 'm-1', rid: '100', text: 'x', savedAt: 1 };

describe('buildMessagePermalink', () => {
  it('Chatwork のメッセージパーマリンクを組み立てる', () => {
    expect(buildMessagePermalink('www.chatwork.com', favorite)).toBe(
      'https://www.chatwork.com/#!rid100-m-1',
    );
  });
});

describe('jumpToMessage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ロード済みメッセージへスクロールする', () => {
    document.body.innerHTML = '<div class="_message" data-mid="m-1" data-rid="100">x</div>';
    const el = document.querySelector<HTMLElement>('._message')!;
    el.scrollIntoView = vi.fn();
    expect(jumpToMessage(document, favorite, 'www.chatwork.com')).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalled();
  });

  it('未ロードならパーマリンクへ遷移する', () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { assign },
      writable: true,
    });
    expect(jumpToMessage(document, favorite, 'www.chatwork.com')).toBe(false);
    expect(assign).toHaveBeenCalledWith('https://www.chatwork.com/#!rid100-m-1');
  });
});
