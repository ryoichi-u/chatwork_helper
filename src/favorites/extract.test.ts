import { describe, expect, it } from 'vitest';
import { extractFavoriteData } from './extract';

function messageEl(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

describe('extractFavoriteData', () => {
  it('mid / rid / 本文抜粋を取り出す', () => {
    const el = messageEl(
      '<div class="_message" data-mid="m-1" data-rid="100">  こんにちは\n世界  </div>',
    );
    expect(extractFavoriteData(el)).toEqual({
      mid: 'm-1',
      rid: '100',
      text: 'こんにちは 世界',
    });
  });

  it('mid が無ければ null', () => {
    const el = messageEl('<div class="_message" data-rid="100">x</div>');
    expect(extractFavoriteData(el)).toBeNull();
  });

  it('rid が無ければ null', () => {
    const el = messageEl('<div class="_message" data-mid="m-1">x</div>');
    expect(extractFavoriteData(el)).toBeNull();
  });

  it('本文は最大長で切り詰める', () => {
    const long = 'あ'.repeat(300);
    const el = messageEl(`<div class="_message" data-mid="m-1" data-rid="100">${long}</div>`);
    expect(extractFavoriteData(el)?.text).toHaveLength(200);
  });
});
