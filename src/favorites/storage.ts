import { browser } from 'wxt/browser';
import type { Favorite } from './types';

const STORAGE_KEY = 'favorites';

/** 保存済みのお気に入り一覧を取得する（新しい順） */
export async function getFavorites(): Promise<Favorite[]> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const list = result[STORAGE_KEY];
  return Array.isArray(list) ? (list as Favorite[]) : [];
}

/** お気に入りを追加する（同一 mid は重複追加しない）。更新後の一覧を返す */
export async function addFavorite(favorite: Favorite): Promise<Favorite[]> {
  const list = await getFavorites();
  if (list.some((f) => f.mid === favorite.mid)) return list;
  const next = [favorite, ...list];
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

/** 指定 mid のお気に入りを削除する。更新後の一覧を返す */
export async function removeFavorite(mid: string): Promise<Favorite[]> {
  const next = (await getFavorites()).filter((f) => f.mid !== mid);
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

/** 指定 mid が保存済みか */
export async function isFavorited(mid: string): Promise<boolean> {
  return (await getFavorites()).some((f) => f.mid === mid);
}

/** storage 変更を購読する（パネルのライブ更新用） */
export function onFavoritesChanged(callback: (favorites: Favorite[]) => void): () => void {
  const listener = (changes: Record<string, { newValue?: unknown }>, areaName: string): void => {
    if (areaName !== 'local' || !(STORAGE_KEY in changes)) return;
    const next = changes[STORAGE_KEY]?.newValue;
    callback(Array.isArray(next) ? (next as Favorite[]) : []);
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
