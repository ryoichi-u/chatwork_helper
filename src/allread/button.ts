import { ALL_READ_BUTTON_ID, SELECTORS } from '../dom/selectors';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** チェックマーク付き円の SVG アイコン（旧実装と同じ形状）を DOM API で構築する */
function createCheckIcon(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '16px');
  svg.setAttribute('height', '16px');
  svg.setAttribute('viewBox', '0 0 512 512');

  const polygon = doc.createElementNS(SVG_NS, 'polygon');
  polygon.setAttribute('points', '211.344,306.703 160,256 128,288 211.414,368 384,176 351.703,144');

  const path = doc.createElementNS(SVG_NS, 'path');
  path.setAttribute(
    'd',
    'M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z',
  );

  svg.append(polygon, path);
  return svg;
}

/** 全既読ボタン要素を生成する（innerHTML 不使用） */
export function createAllReadButton(doc: Document): HTMLDivElement {
  const button = doc.createElement('div');
  button.id = ALL_READ_BUTTON_ID;
  button.className = 'cwh-all-read-button';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', 'すべて既読にする');
  button.title = 'すべて既読にする';
  // 新 UI には専用クラスが無いため自前で最低限のスタイルを当てる
  button.style.cssText =
    'display:inline-flex;align-items:center;justify-content:center;' +
    'cursor:pointer;padding:4px;margin:0 4px;color:#7e8c99;';
  button.appendChild(createCheckIcon(doc));
  return button;
}

/**
 * 全既読ボタンをルーム一覧ヘッダ（フィルタボタンの隣）に設置する。
 * 既存ボタンがあれば置き換える。挿入先が見つからなければ null。
 *
 * フィルタボタンの直接の親は display:block のラッパなので、そこへ入れると
 * 縦積みになり崩れる。フィルタボタンを内包する flex 行まで遡り、その行の
 * item（フィルタボタン側のブロック）の直前に挿入して横並びにする。
 */
export function attachAllReadButton(
  doc: Document,
  onClick: (event: MouseEvent) => void,
): HTMLDivElement | null {
  doc.getElementById(ALL_READ_BUTTON_ID)?.remove();

  const filterButton = doc.querySelector(SELECTORS.roomListFilterButton);
  if (!filterButton) return null;

  const button = createAllReadButton(doc);
  button.addEventListener('click', onClick);

  // フィルタボタンを含む flex 行を探し、その行の直接の子（= anchor）の前に挿入する
  const view = doc.defaultView;
  let anchor: Element = filterButton;
  let parent = filterButton.parentElement;
  while (parent && view && view.getComputedStyle(parent).display !== 'flex') {
    anchor = parent;
    parent = parent.parentElement;
  }
  anchor.before(button);
  return button;
}
