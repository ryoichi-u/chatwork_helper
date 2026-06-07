import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PANEL_ID, renderFavoritesPanel } from './panel';
import type { Favorite } from './types';

const favorites: Favorite[] = [
  { mid: 'm-1', rid: '100', text: '最初のメッセージ', savedAt: 2 },
  { mid: 'm-2', rid: '200', text: '次のメッセージ', savedAt: 1 },
];

function handlers() {
  return { onJump: vi.fn(), onRemove: vi.fn(), onClose: vi.fn() };
}

describe('renderFavoritesPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('件数とアイテムを表示する', () => {
    const panel = renderFavoritesPanel(document, favorites, handlers());
    expect(panel.id).toBe(PANEL_ID);
    expect(panel.querySelector('.cwh-fav-header')?.textContent).toContain('(2)');
    expect(panel.querySelectorAll('.cwh-fav-item')).toHaveLength(2);
  });

  it('本文クリックで onJump が呼ばれる', () => {
    const h = handlers();
    const panel = renderFavoritesPanel(document, favorites, h);
    panel.querySelector<HTMLElement>('.cwh-fav-text')?.click();
    expect(h.onJump).toHaveBeenCalledWith(favorites[0]);
  });

  it('削除ボタンで onRemove が呼ばれる', () => {
    const h = handlers();
    const panel = renderFavoritesPanel(document, favorites, h);
    panel.querySelector<HTMLButtonElement>('.cwh-fav-item button')?.click();
    expect(h.onRemove).toHaveBeenCalledWith(favorites[0]);
  });

  it('閉じるボタンで onClose が呼ばれる', () => {
    const h = handlers();
    const panel = renderFavoritesPanel(document, favorites, h);
    panel.querySelector<HTMLButtonElement>('.cwh-fav-header button')?.click();
    expect(h.onClose).toHaveBeenCalled();
  });

  it('空のときは空メッセージを表示する', () => {
    const panel = renderFavoritesPanel(document, [], handlers());
    expect(panel.querySelector('.cwh-fav-empty')).not.toBeNull();
    expect(panel.querySelectorAll('.cwh-fav-item')).toHaveLength(0);
  });

  it('innerHTML を使わず DOM API で構築する（XSS 対策）', () => {
    const xss: Favorite[] = [
      { mid: 'm-x', rid: '1', text: '<img src=x onerror=alert(1)>', savedAt: 1 },
    ];
    const panel = renderFavoritesPanel(document, xss, handlers());
    // テキストとして挿入されるため img 要素は生成されない
    expect(panel.querySelector('img')).toBeNull();
    expect(panel.querySelector('.cwh-fav-text')?.textContent).toBe('<img src=x onerror=alert(1)>');
  });
});
