import { describe, expect, it } from 'vitest';
import {
  applyMention,
  buildToTag,
  filterMembers,
  findMentionToken,
  type RoomMember,
} from './toTag';

const members: RoomMember[] = [
  { accountId: '111', name: '山田太郎' },
  { accountId: '222', name: '佐藤花子' },
  { accountId: '333', name: 'Taro Yamada' },
];

describe('buildToTag', () => {
  it('Chatwork の TO タグ記法を組み立てる', () => {
    expect(buildToTag({ accountId: '12345', name: '山田太郎' })).toBe('[To:12345] 山田太郎さん');
  });
});

describe('findMentionToken', () => {
  it('行頭の @ クエリを検出する', () => {
    expect(findMentionToken('@山田', 3)).toEqual({ start: 0, query: '山田' });
  });

  it('空白直後の @ を検出する', () => {
    expect(findMentionToken('hi @sato', 8)).toEqual({ start: 3, query: 'sato' });
  });

  it('メールアドレス中の @ は検出しない', () => {
    expect(findMentionToken('mail@example', 12)).toBeNull();
  });

  it('クエリに空白が入ったら無効', () => {
    expect(findMentionToken('@山田 太郎', 6)).toBeNull();
  });

  it('@ が無ければ null', () => {
    expect(findMentionToken('こんにちは', 5)).toBeNull();
  });
});

describe('filterMembers', () => {
  it('名前の部分一致で絞る', () => {
    expect(filterMembers(members, '山田').map((m) => m.accountId)).toEqual(['111']);
  });

  it('大文字小文字を無視する', () => {
    expect(filterMembers(members, 'taro').map((m) => m.accountId)).toEqual(['333']);
  });

  it('アカウント ID でも絞れる', () => {
    expect(filterMembers(members, '222').map((m) => m.accountId)).toEqual(['222']);
  });

  it('空クエリは全件返す', () => {
    expect(filterMembers(members, '')).toHaveLength(3);
  });
});

describe('applyMention', () => {
  it('@クエリ を TO タグ + スペースに置換しカーソルを末尾へ', () => {
    const text = 'おはよう @山';
    const cursor = text.length;
    const token = findMentionToken(text, cursor)!;
    const result = applyMention(text, token, members[0]!, cursor);
    expect(result.text).toBe('おはよう [To:111] 山田太郎さん ');
    expect(result.cursor).toBe(result.text.length);
  });

  it('@クエリ の後ろのテキストは保持する', () => {
    const text = '@山 よろしく';
    const cursor = 2; // "@山" の直後（スペースの手前）
    const token = findMentionToken(text, cursor)!;
    const result = applyMention(text, token, members[0]!, cursor);
    expect(result.text).toBe('[To:111] 山田太郎さん  よろしく');
  });
});
