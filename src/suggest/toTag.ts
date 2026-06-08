/** ルームメンバー1人分の情報 */
export interface RoomMember {
  accountId: string;
  name: string;
}

/**
 * Chatwork の TO タグ記法を組み立てる。
 *
 * PoC の核心: 本家 JS のメンバー選択処理（無名関数）を介さず、この記法を
 * テキストとして入力欄へ挿入するだけで Chatwork 側が TO として描画・送信できる。
 * 例: `[To:12345] 山田太郎さん`
 */
export function buildToTag(member: RoomMember): string {
  return `[To:${member.accountId}] ${member.name}さん`;
}

/** カーソル直前の `@クエリ` トークンを検出する */
export interface MentionToken {
  /** `@` の位置（テキスト先頭からのインデックス） */
  start: number;
  /** `@` の直後からカーソルまでの検索クエリ */
  query: string;
}

/** メールアドレスのローカル部に使われる ASCII 文字（この直後の `@` はメール扱い） */
const EMAIL_LOCAL_CHAR = /[A-Za-z0-9._%+-]/;

/**
 * カーソル位置の直前にある `@クエリ` を取り出す。
 * - `@` の直前が ASCII 英数字等（メールのローカル部）の場合のみ除外する。
 *   日本語のように単語を空白で区切らない入力（例: `おはよう@山田`）でも発火させるため、
 *   行頭・空白・記号・CJK 文字の直後はすべて対象とする（review #4）。
 * - クエリに空白を含む場合はトークン終了とみなし null
 */
export function findMentionToken(text: string, cursor: number): MentionToken | null {
  const before = text.slice(0, cursor);
  const atIndex = before.lastIndexOf('@');
  if (atIndex < 0) return null;

  // `@` の直前が ASCII のメールローカル部文字なら（foo@... のような）メール扱いで除外
  const prevChar = atIndex > 0 ? before[atIndex - 1] : '';
  if (prevChar !== undefined && prevChar !== '' && EMAIL_LOCAL_CHAR.test(prevChar)) return null;
  // 直前が `@`/`＠` の場合は全員宛て `@@` ショートカットなのでメンション扱いしない
  if (prevChar === '@' || prevChar === '＠') return null;

  const query = before.slice(atIndex + 1);
  if (/\s/.test(query)) return null; // 空白を含んだらトークン終了

  return { start: atIndex, query };
}

/** メンバー名・アカウント ID で部分一致（大文字小文字無視）フィルタする */
export function filterMembers(members: RoomMember[], query: string): RoomMember[] {
  const q = query.toLowerCase();
  if (q === '') return members;
  return members.filter(
    (m) => m.name.toLowerCase().includes(q) || m.accountId.toLowerCase().includes(q),
  );
}

/**
 * `@クエリ` を TO タグ + 末尾スペースに置き換えた結果を返す（カーソル位置付き）。
 */
export function applyMention(
  text: string,
  token: MentionToken,
  member: RoomMember,
  cursor: number,
): { text: string; cursor: number } {
  const tag = `${buildToTag(member)} `;
  const newText = text.slice(0, token.start) + tag + text.slice(cursor);
  return { text: newText, cursor: token.start + tag.length };
}
