/**
 * セレクタに一致する要素が DOM に現れるまで待つ。
 * 旧実装の「3秒 setTimeout」ハックの置き換え。タイムアウト時は null を返す。
 */
export function waitForElement<T extends Element>(
  selector: string,
  timeoutMs = 30_000,
): Promise<T | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}
