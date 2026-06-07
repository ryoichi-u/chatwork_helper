import { SELECTORS } from '../dom/selectors';
import type { Favorite } from './types';

/**
 * Chatwork のメッセージパーマリンクを組み立てる。
 * 例: https://www.chatwork.com/#!rid123-456
 */
export function buildMessagePermalink(hostname: string, favorite: Favorite): string {
  return `https://${hostname}/#!rid${favorite.rid}-${favorite.mid}`;
}

/**
 * お気に入りのメッセージへジャンプする。
 * - DOM 上に該当メッセージが既にロードされていれば scrollIntoView でハイライト
 * - 未ロードならパーマリンクへ遷移（Chatwork 側が該当位置を開く）
 * @returns ロード済みメッセージへスクロールできたか
 */
export function jumpToMessage(doc: Document, favorite: Favorite, hostname: string): boolean {
  const selector = `${SELECTORS.message}[data-mid="${CSS.escape(favorite.mid)}"]`;
  const el = doc.querySelector<HTMLElement>(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }
  doc.defaultView?.location.assign(buildMessagePermalink(hostname, favorite));
  return false;
}
