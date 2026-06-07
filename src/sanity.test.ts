import { describe, expect, it } from 'vitest';

// スキャフォルド検証用のサニティテスト（Phase 2 で実テストに置き換える）
describe('test environment', () => {
  it('DOM が利用できる (happy-dom)', () => {
    const el = document.createElement('div');
    el.textContent = 'chatwork helper';
    expect(el.textContent).toBe('chatwork helper');
  });
});
