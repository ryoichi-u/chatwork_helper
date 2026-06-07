import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyMessageFilter,
  FILTER_BANNER_ID,
  FILTER_CLASS,
  FILTER_STYLE_ID,
} from './messageFilter';

function setupTimeline(): void {
  document.head.innerHTML = '';
  document.body.className = '';
  document.body.innerHTML = `
    <div class="_message chatTimeLineMessageMention" id="m1"></div>
    <div class="_message chatTimeLineMessageMine" id="m2"></div>
    <div class="_message" id="m3"></div>
  `;
}

describe('applyMessageFilter (CSS クラス方式・Issue #4)', () => {
  beforeEach(setupTimeline);

  it('スタイルシートを一度だけ注入する', () => {
    applyMessageFilter(document, 'me');
    applyMessageFilter(document, 'mine');
    expect(document.querySelectorAll(`#${FILTER_STYLE_ID}`)).toHaveLength(1);
  });

  it('me: body に me フィルタクラスを付与する', () => {
    applyMessageFilter(document, 'me');
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(true);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(false);
  });

  it('mine: body に mine フィルタクラスを付与する', () => {
    applyMessageFilter(document, 'mine');
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(true);
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
  });

  it('me → mine の切り替えでクラスが排他になる', () => {
    applyMessageFilter(document, 'me');
    applyMessageFilter(document, 'mine');
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(true);
  });

  it('all: 全フィルタクラスを除去する', () => {
    applyMessageFilter(document, 'me');
    applyMessageFilter(document, 'all');
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.body.classList.contains(FILTER_CLASS.mine)).toBe(false);
  });

  it('フィルタ中はバナーを表示し、all で除去する', () => {
    applyMessageFilter(document, 'me');
    expect(document.getElementById(FILTER_BANNER_ID)).not.toBeNull();
    applyMessageFilter(document, 'all');
    expect(document.getElementById(FILTER_BANNER_ID)).toBeNull();
  });

  it('バナーの解除ボタンでフィルタが解除される', () => {
    applyMessageFilter(document, 'me');
    const button = document.querySelector<HTMLButtonElement>(`#${FILTER_BANNER_ID} button`);
    expect(button).not.toBeNull();
    button?.click();
    expect(document.body.classList.contains(FILTER_CLASS.me)).toBe(false);
    expect(document.getElementById(FILTER_BANNER_ID)).toBeNull();
  });

  it('バナーは重複しない', () => {
    applyMessageFilter(document, 'me');
    applyMessageFilter(document, 'mine');
    expect(document.querySelectorAll(`#${FILTER_BANNER_ID}`)).toHaveLength(1);
  });
});
