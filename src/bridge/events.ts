/**
 * MAIN world（page-bridge）⇄ ISOLATED world（helper）間の CustomEvent 名。
 *
 * セキュリティノート:
 * - 流れる情報（MYID / ACCESS_TOKEN 等）は元々ページのグローバル変数であり、
 *   ページ上のスクリプトは既に読める。このブリッジが新たに公開する情報はない。
 * - ISOLATED 側からページへ秘密情報を送ることはない（リクエストイベントは空）。
 * - detail はワールド間で安全に受け渡すため JSON 文字列にシリアライズする。
 */
export const CREDENTIALS_REQUEST_EVENT = 'chatwork-helper:request-credentials';
export const CREDENTIALS_RESPONSE_EVENT = 'chatwork-helper:credentials';

/** page-bridge が ISOLATED 側へ渡すページ変数のスナップショット */
export interface Credentials {
  myid: string;
  accessToken: string;
  clientVer: string;
  language: string;
}

/** 受信した JSON を Credentials として検証する（不正な形は null） */
export function parseCredentials(json: unknown): Credentials | null {
  if (typeof json !== 'string') return null;
  try {
    const data: unknown = JSON.parse(json);
    if (typeof data !== 'object' || data === null) return null;
    const { myid, accessToken, clientVer, language } = data as Record<string, unknown>;
    if (typeof myid !== 'string' || myid === '') return null;
    if (typeof accessToken !== 'string' || accessToken === '') return null;
    return {
      myid,
      accessToken,
      clientVer: typeof clientVer === 'string' ? clientVer : '',
      language: typeof language === 'string' ? language : 'ja',
    };
  } catch {
    return null;
  }
}
