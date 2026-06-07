import { MESSAGE_CLASSES, SELECTORS } from '../dom/selectors';
import type { FilterMode } from './types';

/**
 * タイムラインのメッセージ表示フィルタ。
 * - me:   自分宛て TO/メンションのみ表示
 * - mine: 自分の送信メッセージのみ表示
 * - all:  すべて表示（フィルタ解除）
 */
export function applyMessageFilter(root: ParentNode, mode: FilterMode): void {
  const messages = root.querySelectorAll<HTMLElement>(SELECTORS.message);
  for (const message of messages) {
    const visible =
      mode === 'all' ||
      message.classList.contains(mode === 'me' ? MESSAGE_CLASSES.mention : MESSAGE_CLASSES.mine);
    message.style.display = visible ? '' : 'none';
  }
}
