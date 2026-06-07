import { beforeEach, describe, expect, it } from 'vitest';
import { applyMessageFilter } from './messageFilter';

function setupTimeline(): void {
  document.body.innerHTML = `
    <div class="_message chatTimeLineMessageMention" id="m1"></div>
    <div class="_message chatTimeLineMessageMine" id="m2"></div>
    <div class="_message" id="m3"></div>
  `;
}

const display = (id: string) => (document.getElementById(id) as HTMLElement).style.display;

describe('applyMessageFilter', () => {
  beforeEach(setupTimeline);

  it('me: 自分宛て TO のみ表示する', () => {
    applyMessageFilter(document, 'me');
    expect(display('m1')).toBe('');
    expect(display('m2')).toBe('none');
    expect(display('m3')).toBe('none');
  });

  it('mine: 自分の送信のみ表示する', () => {
    applyMessageFilter(document, 'mine');
    expect(display('m1')).toBe('none');
    expect(display('m2')).toBe('');
    expect(display('m3')).toBe('none');
  });

  it('all: フィルタを解除して全表示する', () => {
    applyMessageFilter(document, 'me');
    applyMessageFilter(document, 'all');
    expect(display('m1')).toBe('');
    expect(display('m2')).toBe('');
    expect(display('m3')).toBe('');
  });
});
