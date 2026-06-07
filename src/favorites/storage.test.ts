import { fakeBrowser } from 'wxt/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { addFavorite, getFavorites, isFavorited, removeFavorite } from './storage';
import type { Favorite } from './types';

const fav = (mid: string): Favorite => ({
  mid,
  rid: '100',
  text: `message ${mid}`,
  savedAt: 1000,
});

describe('favorites storage', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('初期状態は空配列', async () => {
    expect(await getFavorites()).toEqual([]);
  });

  it('追加すると新しい順で先頭に入る', async () => {
    await addFavorite(fav('1'));
    await addFavorite(fav('2'));
    const list = await getFavorites();
    expect(list.map((f) => f.mid)).toEqual(['2', '1']);
  });

  it('同一 mid は重複追加しない', async () => {
    await addFavorite(fav('1'));
    await addFavorite(fav('1'));
    expect(await getFavorites()).toHaveLength(1);
  });

  it('削除できる', async () => {
    await addFavorite(fav('1'));
    await addFavorite(fav('2'));
    await removeFavorite('1');
    const list = await getFavorites();
    expect(list.map((f) => f.mid)).toEqual(['2']);
  });

  it('isFavorited が保存状態を返す', async () => {
    await addFavorite(fav('1'));
    expect(await isFavorited('1')).toBe(true);
    expect(await isFavorited('999')).toBe(false);
  });
});
