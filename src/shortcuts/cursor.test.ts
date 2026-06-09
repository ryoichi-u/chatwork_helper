import { describe, expect, it } from 'vitest';
import { expandTagWithCursor, stripCommandWithCursor, toallWithCursor } from './cursor';

describe('toallWithCursor', () => {
  it('@@ を [toall] に置換し、置換区間より後のカーソルをシフトする', () => {
    // "@@ みんな" でカーソルが末尾(6)にある場合
    const result = toallWithCursor('@@ みんな', 6);
    expect(result.text).toBe('[toall] みんな');
    // 2文字 → 7文字、差分 +5
    expect(result.cursor).toBe(11);
  });

  it('置換区間より前のカーソルは動かさない', () => {
    const result = toallWithCursor('x\n@@', 1);
    expect(result.cursor).toBe(1);
  });
});

describe('stripCommandWithCursor', () => {
  it('コマンドを除去し、後続カーソルを詰める', () => {
    // ":to\nhello" カーソルが末尾(9)
    const result = stripCommandWithCursor(':to\nhello', ':to', 9);
    expect(result.text).toBe('\nhello');
    expect(result.cursor).toBe(6); // 9 - 3
  });

  it('コマンドより前のカーソルは保持する', () => {
    const result = stripCommandWithCursor('ab\n:to', ':to', 2);
    expect(result.cursor).toBe(2);
  });

  it('コマンドが無ければそのまま', () => {
    const result = stripCommandWithCursor('hello', ':to', 3);
    expect(result).toEqual({ text: 'hello', cursor: 3 });
  });
});

describe('expandTagWithCursor', () => {
  it('カーソルを開きタグと閉じタグの間に置く', () => {
    const result = expandTagWithCursor(':info', 'info', 5);
    expect(result.text).toBe('[info]\n[/info]');
    // "[info]\n".length = 7
    expect(result.cursor).toBe(7);
  });

  it('前置きテキストがあってもタグ内側を指す', () => {
    const result = expandTagWithCursor('メモ\n:code', 'code', 8);
    expect(result.text).toBe('メモ\n[code]\n[/code]');
    // index("メモ\n":code) = 3, open "[code]\n".length = 7 → 10
    expect(result.cursor).toBe(10);
  });
});
