import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCredentialsCache, requestCredentials } from './credentials';
import { CREDENTIALS_REQUEST_EVENT, CREDENTIALS_RESPONSE_EVENT, parseCredentials } from './events';

/** page-bridge (MAIN world) 相当の応答スクリプトを模倣する */
function installResponder(payload: Record<string, string>) {
  const handler = () => {
    window.dispatchEvent(
      new CustomEvent(CREDENTIALS_RESPONSE_EVENT, { detail: JSON.stringify(payload) }),
    );
  };
  window.addEventListener(CREDENTIALS_REQUEST_EVENT, handler);
  return () => window.removeEventListener(CREDENTIALS_REQUEST_EVENT, handler);
}

describe('parseCredentials', () => {
  it('正しい JSON を Credentials に変換する', () => {
    expect(
      parseCredentials(
        JSON.stringify({ myid: '1', accessToken: 't', clientVer: 'v', language: 'ja' }),
      ),
    ).toEqual({ myid: '1', accessToken: 't', clientVer: 'v', language: 'ja' });
  });

  it('accessToken / myid が空なら null', () => {
    expect(parseCredentials(JSON.stringify({ myid: '', accessToken: 't' }))).toBeNull();
    expect(parseCredentials(JSON.stringify({ myid: '1', accessToken: '' }))).toBeNull();
  });

  it('文字列以外・壊れた JSON は null', () => {
    expect(parseCredentials(undefined)).toBeNull();
    expect(parseCredentials(123)).toBeNull();
    expect(parseCredentials('{not json')).toBeNull();
    expect(parseCredentials('"just a string"')).toBeNull();
  });
});

describe('requestCredentials', () => {
  let uninstall: (() => void) | null = null;

  beforeEach(() => {
    clearCredentialsCache();
  });

  afterEach(() => {
    uninstall?.();
    uninstall = null;
    vi.useRealTimers();
  });

  it('page-bridge の応答からページ変数を取得する', async () => {
    uninstall = installResponder({
      myid: '12345',
      accessToken: 'token-abc',
      clientVer: '2.0',
      language: 'ja',
    });

    await expect(requestCredentials()).resolves.toEqual({
      myid: '12345',
      accessToken: 'token-abc',
      clientVer: '2.0',
      language: 'ja',
    });
  });

  it('2回目以降はキャッシュを返す（再要求しない）', async () => {
    uninstall = installResponder({
      myid: '12345',
      accessToken: 'token-abc',
      clientVer: '2.0',
      language: 'ja',
    });
    const first = await requestCredentials();
    uninstall();
    uninstall = null;

    await expect(requestCredentials()).resolves.toEqual(first);
  });

  it('不正な応答は無視して待ち続け、タイムアウトで reject する', async () => {
    vi.useFakeTimers();
    uninstall = installResponder({ myid: '', accessToken: '' }); // ページ変数が未初期化

    const promise = requestCredentials(3_000, 500);
    const assertion = expect(promise).rejects.toThrowError(/取得できませんでした/);
    await vi.advanceTimersByTimeAsync(3_100);
    await assertion;
  });
});
