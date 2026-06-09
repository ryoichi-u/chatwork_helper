import { cwtagSelector, SELECTORS } from '../dom/selectors';
import type { FilterMode } from './types';

/**
 * メッセージ表示フィルタ（Issue #4）。
 *
 * 旧実装は各メッセージ要素の `style.display` を直接操作していたため、
 * 新規ロードされたメッセージにフィルタが効かず、Chatwork 側の再レンダリングと
 * 競合する問題があった。
 *
 * 新 UI（React + styled-components）には mine/mention を示す固定クラスが無いため、
 * 本実装は body にフィルタ用クラスを付与し、`:has()` セレクタで判定する:
 * - 自分宛て: メッセージ内に `[data-cwtag="[To:<myid>]"]` または `[toall]` を含む
 * - 自分の送信: 送信者アバター（`._speaker` 内）の `[data-aid="<myid>"]`
 *
 * これにより後から追加されたメッセージにも自動でフィルタが適用され、
 * 要素単位の操作を行わない。フィルタ中バナー + ワンクリック解除も表示する。
 */
export const FILTER_STYLE_ID = 'cwh-filter-style';
export const FILTER_BANNER_ID = 'cwh-filter-banner';
export const FILTER_CLASS: Record<Exclude<FilterMode, 'all'>, string> = {
  me: 'cwh-filter-me',
  mine: 'cwh-filter-mine',
};

/** myid を埋め込んだフィルタ用スタイルを生成する */
export function buildFilterStyleText(myid: string): string {
  const msg = SELECTORS.message;
  const toMe = cwtagSelector(`[To:${myid}]`);
  const toAll = cwtagSelector('[toall]');
  const mineAvatar = `${SELECTORS.messageSpeaker} [data-aid="${myid}"]`;
  return `
.${FILTER_CLASS.me} ${msg}:not(:has(${toMe})):not(:has(${toAll})) {
  display: none !important;
}
.${FILTER_CLASS.mine} ${msg}:not(:has(${mineAvatar})) {
  display: none !important;
}
#${FILTER_BANNER_ID} {
  position: fixed;
  top: 0;
  right: 16px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f0ad4e;
  color: #fff;
  font-size: 12px;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
#${FILTER_BANNER_ID} button {
  cursor: pointer;
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
}
`;
}

const BANNER_LABEL: Record<Exclude<FilterMode, 'all'>, string> = {
  me: '自分宛てのメッセージのみ表示中',
  mine: '自分の送信のみ表示中',
};

/** フィルタ用スタイルシートを一度だけ注入する（myid 不明時は何もしない） */
export function ensureFilterStyle(doc: Document, myid: string | null): void {
  if (doc.getElementById(FILTER_STYLE_ID)) return;
  if (!myid) return;
  const style = doc.createElement('style');
  style.id = FILTER_STYLE_ID;
  style.textContent = buildFilterStyleText(myid);
  (doc.head ?? doc.documentElement).appendChild(style);
}

/** フィルタ中バナーを更新する（mode='all' で除去） */
function updateBanner(doc: Document, mode: FilterMode, myid: string | null): void {
  doc.getElementById(FILTER_BANNER_ID)?.remove();
  if (mode === 'all') return;

  const banner = doc.createElement('div');
  banner.id = FILTER_BANNER_ID;

  const label = doc.createElement('span');
  label.textContent = BANNER_LABEL[mode];

  const clearButton = doc.createElement('button');
  clearButton.type = 'button';
  clearButton.textContent = '解除';
  clearButton.addEventListener('click', () => applyMessageFilter(doc, 'all', myid));

  banner.append(label, clearButton);
  doc.body.appendChild(banner);
}

/**
 * メッセージ表示フィルタを適用する。
 * - me:   自分宛て TO（[To:myid]）/全員宛て（[toall]）のみ表示
 * - mine: 自分の送信メッセージのみ表示
 * - all:  フィルタ解除
 */
export function applyMessageFilter(doc: Document, mode: FilterMode, myid: string | null): void {
  ensureFilterStyle(doc, myid);
  const root = doc.body;
  root.classList.remove(FILTER_CLASS.me, FILTER_CLASS.mine);
  if (mode !== 'all') {
    root.classList.add(FILTER_CLASS[mode]);
  }
  updateBanner(doc, mode, myid);
}
