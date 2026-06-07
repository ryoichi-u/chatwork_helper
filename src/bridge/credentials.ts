import {
  CREDENTIALS_REQUEST_EVENT,
  CREDENTIALS_RESPONSE_EVENT,
  parseCredentials,
  type Credentials,
} from './events';

let cached: Credentials | null = null;

/**
 * ISOLATED world から MAIN world の page-bridge へページ変数を要求する。
 * ページ変数の初期化が遅れる場合に備え、応答が得られるまで一定間隔で再要求する。
 */
export function requestCredentials(
  timeoutMs = 10_000,
  retryIntervalMs = 500,
): Promise<Credentials> {
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener(CREDENTIALS_RESPONSE_EVENT, onResponse);
      clearInterval(retryTimer);
      clearTimeout(timeoutTimer);
    };

    const onResponse = (event: Event) => {
      const credentials = parseCredentials((event as CustomEvent).detail);
      if (!credentials) return; // ページ変数が未初期化のうちは再要求を続ける
      cached = credentials;
      cleanup();
      resolve(credentials);
    };

    window.addEventListener(CREDENTIALS_RESPONSE_EVENT, onResponse);

    const request = () => window.dispatchEvent(new CustomEvent(CREDENTIALS_REQUEST_EVENT));
    const retryTimer = setInterval(request, retryIntervalMs);
    const timeoutTimer = setTimeout(() => {
      cleanup();
      reject(new Error('chatwork-helper: ページ変数（MYID 等）を取得できませんでした'));
    }, timeoutMs);

    request();
  });
}

/** テスト用: キャッシュをクリアする */
export function clearCredentialsCache(): void {
  cached = null;
}
