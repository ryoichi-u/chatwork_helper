/** 「あとで読む」に保存された 1 件のメッセージ */
export interface Favorite {
  /** メッセージ ID (data-mid) */
  mid: string;
  /** ルーム ID (data-rid) */
  rid: string;
  /** メッセージ本文の抜粋（保存時にトリム） */
  text: string;
  /** 保存時刻（epoch ミリ秒） */
  savedAt: number;
}
