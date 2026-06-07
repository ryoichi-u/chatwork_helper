import { EXPANDABLE_TAGS, expandTag } from './expandTag';
import { chatShortcuts, taskShortcuts } from './registry';
import type { ChatworkDom } from './types';

/**
 * トリガ判定の正規表現を組み立てる。
 * コマンドが単独行（行頭〜行末）として入力された場合のみ発火する。
 */
export function buildTriggerRegExp(keySource: string): RegExp {
  return new RegExp(`(^|\n)${keySource}($|\n)`);
}

/**
 * チャット入力欄での Enter 時に全ショートカット + タグ展開を判定・実行する。
 * @returns いずれかのコマンドが一致して実行されたか（呼び出し側が Enter の
 *   デフォルト動作（改行挿入・メッセージ送信）を抑止するかの判断に使う）
 */
export function dispatchChatShortcuts(dom: ChatworkDom): boolean {
  let matched = false;

  for (const shortcut of chatShortcuts) {
    if (buildTriggerRegExp(shortcut.key).test(dom.getChatText())) {
      shortcut.run(dom);
      matched = true;
    }
  }

  // タグ展開: `:info` / `:title` / `:code` → `[tag]\n[/tag]`
  for (const tag of EXPANDABLE_TAGS) {
    if (buildTriggerRegExp(`:${tag}`).test(dom.getChatText())) {
      dom.setChatText(expandTag(dom.getChatText(), tag));
      matched = true;
    }
  }

  return matched;
}

/**
 * タスク名入力欄での Enter 時のショートカット判定・実行。
 * @returns いずれかのコマンドが一致して実行されたか
 */
export function dispatchTaskShortcuts(dom: ChatworkDom): boolean {
  let matched = false;
  for (const shortcut of taskShortcuts) {
    if (buildTriggerRegExp(shortcut.key).test(dom.getTaskText())) {
      shortcut.run(dom);
      matched = true;
    }
  }
  return matched;
}
