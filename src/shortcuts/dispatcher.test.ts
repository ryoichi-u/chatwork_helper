import { describe, expect, it } from 'vitest';
import { buildTriggerRegExp, dispatchChatShortcuts, dispatchTaskShortcuts } from './dispatcher';
import type { ChatworkDom } from './types';

/** 呼び出し履歴を記録するテスト用 ChatworkDom */
function fakeDom(initialChat = '', initialTask = '') {
  let chat = initialChat;
  let task = initialTask;
  const calls: string[] = [];
  const dom: ChatworkDom = {
    getChatText: () => chat,
    setChatText: (v) => {
      chat = v;
    },
    focusChatText: () => calls.push('focusChatText'),
    getTaskText: () => task,
    setTaskText: (v) => {
      task = v;
    },
    focusTaskInput: () => calls.push('focusTaskInput'),
    openToList: () => calls.push('openToList'),
    openFileUpload: () => calls.push('openFileUpload'),
    openAssigneeList: () => calls.push('openAssigneeList'),
    focusSearch: () => calls.push('focusSearch'),
    filterMessages: (mode) => calls.push(`filter:${mode}`),
  };
  return { dom, calls, chat: () => chat, task: () => task };
}

describe('buildTriggerRegExp', () => {
  it('単独行のコマンドのみマッチする', () => {
    const re = buildTriggerRegExp(':to');
    expect(re.test(':to')).toBe(true);
    expect(re.test('hello\n:to')).toBe(true);
    expect(re.test(':to\nhello')).toBe(true);
    expect(re.test('hello :to')).toBe(false); // 行中はマッチしない
    expect(re.test(':toxyz')).toBe(false);
  });
});

describe('dispatchChatShortcuts', () => {
  it('@@ → [toall] に置換してフォーカスする', () => {
    const f = fakeDom('@@');
    expect(dispatchChatShortcuts(f.dom)).toBe(true);
    expect(f.chat()).toBe('[toall]');
    expect(f.calls).toContain('focusChatText');
  });

  it('行中の @@ では発火しない（matched=false）', () => {
    const f = fakeDom('mail@@example.com');
    expect(dispatchChatShortcuts(f.dom)).toBe(false);
    expect(f.chat()).toBe('mail@@example.com');
    expect(f.calls).toHaveLength(0);
  });

  it('コマンドを含まない通常テキストは matched=false', () => {
    const f = fakeDom('こんにちは');
    expect(dispatchChatShortcuts(f.dom)).toBe(false);
    expect(f.calls).toHaveLength(0);
  });

  it(':to → TO リストを開いてコマンドを除去する', () => {
    const f = fakeDom(':to');
    dispatchChatShortcuts(f.dom);
    expect(f.calls).toContain('openToList');
    expect(f.chat()).toBe('');
  });

  it(':file → ファイルアップロードを開く（:f とは独立）', () => {
    const f = fakeDom(':file');
    dispatchChatShortcuts(f.dom);
    expect(f.calls).toContain('openFileUpload');
    expect(f.calls).not.toContain('focusSearch');
    expect(f.chat()).toBe('');
  });

  it(':f → 検索ボックスへフォーカスする', () => {
    const f = fakeDom(':f');
    dispatchChatShortcuts(f.dom);
    expect(f.calls).toContain('focusSearch');
    expect(f.chat()).toBe('');
  });

  it(':me / :mine / :all → メッセージフィルタを適用する', () => {
    for (const [cmd, mode] of [
      [':me', 'me'],
      [':mine', 'mine'],
      [':all', 'all'],
    ] as const) {
      const f = fakeDom(cmd);
      dispatchChatShortcuts(f.dom);
      expect(f.calls).toContain(`filter:${mode}`);
      expect(f.chat()).toBe('');
    }
  });

  it(':mine で :me は発火しない', () => {
    const f = fakeDom(':mine');
    dispatchChatShortcuts(f.dom);
    expect(f.calls).not.toContain('filter:me');
  });

  it(':task → 本文をタスク名入力欄へ移す', () => {
    const f = fakeDom('バグを直す\n:task');
    dispatchChatShortcuts(f.dom);
    expect(f.task()).toBe('バグを直す\n');
    expect(f.chat()).toBe('');
    expect(f.calls).toContain('focusTaskInput');
  });

  it(':info → タグに展開する', () => {
    const f = fakeDom('メモ\n:info');
    dispatchChatShortcuts(f.dom);
    expect(f.chat()).toBe('メモ\n[info]\n[/info]');
  });

  it(':title / :code → タグに展開する', () => {
    const t = fakeDom(':title');
    dispatchChatShortcuts(t.dom);
    expect(t.chat()).toBe('[title]\n[/title]');

    const c = fakeDom(':code');
    dispatchChatShortcuts(c.dom);
    expect(c.chat()).toBe('[code]\n[/code]');
  });

  it('チャット欄の :to ではタスク担当者リストは開かない', () => {
    const f = fakeDom(':to');
    dispatchChatShortcuts(f.dom);
    expect(f.calls).not.toContain('openAssigneeList');
  });
});

describe('dispatchTaskShortcuts', () => {
  it('タスク入力欄の :to → 担当者リストを開いてコマンドを除去する', () => {
    const f = fakeDom('', 'レビュー依頼\n:to');
    expect(dispatchTaskShortcuts(f.dom)).toBe(true);
    expect(f.calls).toContain('openAssigneeList');
    expect(f.task()).toBe('レビュー依頼\n');
  });

  it(':to を含まない場合は何もしない（matched=false）', () => {
    const f = fakeDom('', 'レビュー依頼');
    expect(dispatchTaskShortcuts(f.dom)).toBe(false);
    expect(f.calls).toHaveLength(0);
  });
});
