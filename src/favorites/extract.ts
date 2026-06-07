import type { Favorite } from './types';

/** 本文抜粋の最大長 */
export const EXCERPT_MAX_LENGTH = 200;

/**
 * メッセージ要素から保存用データ（mid / rid / 本文抜粋）を取り出す。
 * mid または rid が無い要素は保存対象外として null を返す。
 */
export function extractFavoriteData(messageEl: HTMLElement): Omit<Favorite, 'savedAt'> | null {
  const mid = messageEl.dataset.mid;
  const rid = messageEl.dataset.rid;
  if (!mid || !rid) return null;

  const text = (messageEl.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, EXCERPT_MAX_LENGTH);
  return { mid, rid, text };
}
