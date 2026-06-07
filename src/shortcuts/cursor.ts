import { replaceToall } from './replaceToall';
import type { ExpandableTag } from './expandTag';

/** テキストとカーソル位置（selectionStart）のペア */
export interface TextWithCursor {
  text: string;
  cursor: number;
}

/**
 * テキストの一部を置換した際のカーソル位置を、置換区間との位置関係から補正する。
 * - カーソルが置換区間より前: そのまま
 * - 置換区間より後: 文字数の増減分だけシフト
 * - 置換区間の内側: 置換後文字列の末尾へ寄せる
 */
function shiftCursor(
  cursor: number,
  matchIndex: number,
  matchLength: number,
  replacementLength: number,
): number {
  if (cursor <= matchIndex) return cursor;
  if (cursor >= matchIndex + matchLength) {
    return cursor + (replacementLength - matchLength);
  }
  return matchIndex + replacementLength;
}

/** `@@` → `[toall]` 置換（カーソル位置を保持） */
export function toallWithCursor(text: string, cursor: number): TextWithCursor {
  const match = /[@＠]{2}/.exec(text);
  const newText = replaceToall(text);
  if (!match) return { text: newText, cursor };
  return {
    text: newText,
    cursor: shiftCursor(cursor, match.index, match[0].length, '[toall]'.length),
  };
}

/** コマンド文字列（`:to` 等）の最初の出現を除去（カーソル位置を保持） */
export function stripCommandWithCursor(
  text: string,
  command: string,
  cursor: number,
): TextWithCursor {
  const index = text.indexOf(command);
  if (index < 0) return { text, cursor };
  const newText = text.slice(0, index) + text.slice(index + command.length);
  return { text: newText, cursor: shiftCursor(cursor, index, command.length, 0) };
}

/**
 * `:tag` → `[tag]\n[/tag]` 展開（カーソルは開きタグと閉じタグの間へ置く）。
 * Issue #3: 展開直後にそのまま本文を打てるようにするため。
 */
export function expandTagWithCursor(
  text: string,
  tag: ExpandableTag,
  cursor: number,
): TextWithCursor {
  const command = `:${tag}`;
  const index = text.indexOf(command);
  const open = `[${tag}]\n`;
  const replacement = `${open}[/${tag}]`;
  if (index < 0) return { text, cursor };
  const newText = text.slice(0, index) + replacement + text.slice(index + command.length);
  // カーソルは「[tag]\n」の直後（タグの内側）に固定する
  return { text: newText, cursor: index + open.length };
}
