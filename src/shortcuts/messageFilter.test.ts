import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyMessageFilter,
  buildFilterStyleText,
  FILTER_BANNER_ID,
  FILTER_CLASS,
  FILTER_STYLE_ID,
} from './messageFilter';

const MYID = '100';

function setupTimeline(): void {
  document.head.innerHTML = '';
  document.body.className = '';
  document.body.innerHTML = `
    <div class="_message" id="m1"><div data-cwtag="[To:100]"></div></div>
    <div class="_message" id="m2"><div class="_speaker"><div data-aid="100"></div></div></div>
    <div class="_message" id="m3"></div>
  `;
}

describe('buildFilterStyleText', () => {
  it('myid を埋めた :has() セレクタを生成する', () => {
    const css = buildFilterStyleText(MYID);
    // 自分宛て TO と全員宛てを表示対象に
    expect(css).toContain('[data-cwtag="[To:100]"]');
    expect(css).toContain('[data-cwtag="[toall]"]');
    // 自分の送信は送信者アバターで判定
    expect(css).toContain('._speaker [data-aid="100"]');
  });
});

describe('applyMessageFilter (:has() 方式・Issue #4)', () => {
  beforeEach(setupTimeline);

  it('myid があればスタイルシートを一度だけ注入する', () => {
    applyMessageFilter(document, 'me', MYID);
    applyMessageFilter(document, 'mine', MYID);
    expect(document.querySelectorAll(`#${FILTER_STYLE_ID}`)).toHaveLength(1);
  });

  it('myid=null ではスタイルを注入しない', () => {
    applyMessageFilter(document, 'me', null);
    expect(document.getElementById(FILTER_STYLE_ID)).toBeNull();
  });

  it('me: body に me フィルタクラスを付与する', () => {
    applyMessageFilter(document, 'me', MYID);
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(true);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(false);
  });

  it('mine: body に mine フィルタクラスを付与する', () => {
    applyMessageFilter(document, 'mine', MYID);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(true);
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
  });

  it('me → mine の切り替えでクラスが排他になる', () => {
    applyMessageFilter(document, 'me', MYID);
    applyMessageFilter(document, 'mine', MYID);
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(true);
  });

  it('all: 全フィルタクラスを除去する', () => {
    applyMessageFilter(document, 'me', MYID);
    applyMessageFilter(document, 'all', MYID);
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(false);
  });

  it('フィルタ中はバナーを表示し、all で除去する', () => {
    applyMessageFilter(document, 'me', MYID);
    expect(document.getElementById(FILTER_BANNER_ID)).not.toBeNull();
    applyMessageFilter(document, 'all', MYID);
    expect(document.getElementById(FILTER_BANNER_ID)).toBeNull();
  });

  it('バナーの解除ボタンでフィルタが解除される', () => {
    applyMessageFilter(document, 'me', MYID);
    const button = document.querySelector<HTMLButtonElement>(`#${FILTER_BANNER_ID} button`);
    expect(button).not.toBeNull();
    button?.click();
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.getElementById(FILTER_BANNER_ID)).toBeNull();
  });

  it('バナーは重複しない', () => {
    applyMessageFilter(document, 'me', MYID);
    applyMessageFilter(document, 'mine', MYID);
    expect(document.querySelectorAll(`#${FILTER_BANNER_ID}`)).toHaveLength(1);
  });
});
