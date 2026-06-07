import { describe, expect, it } from 'vitest';
import { replaceToall } from './replaceToall';

describe('replaceToall', () => {
  it('@@ を [toall] に置換する', () => {
    expect(replaceToall('@@')).toBe('[toall]');
  });

  it('全角 ＠＠ も置換する', () => {
    expect(replaceToall('＠＠')).toBe('[toall]');
    expect(replaceToall('@＠')).toBe('[toall]');
  });

  it('最初の1箇所のみ置換する', () => {
    expect(replaceToall('@@\n@@')).toBe('[toall]\n@@');
  });

  it('@@ を含まないテキストはそのまま', () => {
    expect(replaceToall('hello')).toBe('hello');
  });
});
