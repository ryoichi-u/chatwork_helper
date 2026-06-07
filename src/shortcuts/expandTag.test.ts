import { describe, expect, it } from 'vitest';
import { expandTag } from './expandTag';

describe('expandTag', () => {
  it(':info を [info]\\n[/info] に展開する', () => {
    expect(expandTag(':info', 'info')).toBe('[info]\n[/info]');
  });

  it(':title / :code も展開する', () => {
    expect(expandTag(':title', 'title')).toBe('[title]\n[/title]');
    expect(expandTag(':code', 'code')).toBe('[code]\n[/code]');
  });

  it('前後のテキストは保持する', () => {
    expect(expandTag('メモ\n:info', 'info')).toBe('メモ\n[info]\n[/info]');
  });
});
