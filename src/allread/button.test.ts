import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attachAllReadButton, createAllReadButton } from './button';

describe('createAllReadButton', () => {
  it('旧実装と同じ ID / クラスのボタンを生成する', () => {
    const button = createAllReadButton(document);
    expect(button.id).toBe('_openedButton');
    expect(button.className).toBe('roomListHeader__myChatButton');
    expect(button.querySelector('svg')).not.toBeNull();
  });
});

describe('attachAllReadButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="_sideChatMoveMyChat"></div>';
  });

  it('マイチャットボタンの直後に設置される', () => {
    const button = attachAllReadButton(document, () => {});
    expect(button).not.toBeNull();
    expect(document.querySelector('#_sideChatMoveMyChat + #_openedButton')).toBe(button);
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
