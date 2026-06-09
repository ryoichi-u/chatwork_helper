import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attachAllReadButton, createAllReadButton } from './button';

// 実 UI 同様、フィルタボタンを flex 行の中に置く（直前に全既読が横並びで入る）
const FILTER_BUTTON =
  '<div style="display:flex"><div data-testid="room-list-header_room-list-filter-button"></div></div>';

describe('createAllReadButton', () => {
  it('既定の ID / クラス / アイコンを持つボタンを生成する', () => {
    const button = createAllReadButton(document);
    expect(button.id).toBe('_openedButton');
    expect(button.className).toBe('cwh-all-read-button');
    expect(button.querySelector('svg')).not.toBeNull();
  });
});

describe('attachAllReadButton', () => {
  beforeEach(() => {
    document.body.innerHTML = FILTER_BUTTON;
  });

  it('ルーム一覧フィルタボタンの直前に設置される', () => {
    const button = attachAllReadButton(document, () => {});
    expect(button).not.toBeNull();
    const filterBtn = document.querySelector(
      '[data-testid="room-list-header_room-list-filter-button"]',
    );
    expect(button?.nextElementSibling).toBe(filterBtn);
  });

  it('クリックでハンドラが呼ばれる', () => {
    const onClick = vi.fn();
    const button = attachAllReadButton(document, onClick);
    button?.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('既存ボタンがあれば置き換える（重複しない）', () => {
    attachAllReadButton(document, () => {});
    attachAllReadButton(document, () => {});
    expect(document.querySelectorAll('#_openedButton')).toHaveLength(1);
  });

  it('挿入先が無ければ null を返す', () => {
    document.body.innerHTML = '';
    expect(attachAllReadButton(document, () => {})).toBeNull();
  });
});
