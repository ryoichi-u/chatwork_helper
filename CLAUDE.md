# CLAUDE.md

Chatwork 向け Chrome 拡張機能。[WXT](https://wxt.dev/)（TypeScript / Vite / Manifest V3）で構築。

## コマンド

| コマンド                          | 説明                                                                      |
| --------------------------------- | ------------------------------------------------------------------------- |
| `npm ci`                          | 依存インストール（lockfile 厳密再現。`npm install` ではなくこちらを使う） |
| `npm run dev`                     | 開発用 Chrome を起動して拡張をホットリロード付きでロード                  |
| `npm run build`                   | 本番ビルド（`.output/chrome-mv3/`）                                       |
| `npm run zip`                     | Chrome Web Store 用 zip を生成                                            |
| `npm run compile`                 | 型チェック（`tsc --noEmit`）                                              |
| `npm run lint`                    | ESLint                                                                    |
| `npm run format` / `format:check` | Prettier                                                                  |
| `npm test`                        | Vitest 単体テスト（`src/**/*.test.ts`）                                   |
| `npm run test:e2e`                | Playwright E2E（`wxt build` 後にモックページで実行）                      |
| `npm run test:e2e:headed`         | ブラウザ表示つき E2E（`HEADED=1`）                                        |
| `npm run smoke:auth`              | 実 Chatwork スモーク用に手動ログインして認証情報を保存                    |
| `npm run smoke`                   | 実 Chatwork で非破壊系のみ検証（ローカル専用・CI 非対象）                 |

## アーキテクチャ

### content script 2 層構成

- **`entrypoints/page-bridge.content.ts`**（`world: 'MAIN'`）: ページグローバル変数
  `MYID` / `ACCESS_TOKEN` / `CLIENT_VER` / `LANGUAGE` を読み、CustomEvent（JSON 文字列）で
  ISOLATED 側へ受け渡す。
- **`entrypoints/helper.content.ts`**（ISOLATED）: ショートカット・全既読ボタン・お気に入り・
  メンションサジェストの本体。MAIN とは `window.dispatchEvent` / `CustomEvent` で連携。

### ロジック分離方針

DOM 副作用とロジックを分離し、ロジックを純粋関数として Vitest でテストする。

```
src/
├── shortcuts/   ショートカット（純粋関数）+ registry + dispatcher
│                cursor.ts でカーソル位置を保持（Issue #3）
│                messageFilter.ts は CSS クラス方式（Issue #4）
├── allread/     未読走査 / 既読化 POST(fetch) / ボタン生成
├── favorites/   お気に入り（chrome.storage.local）（Issue #5）
├── suggest/     @ メンションサジェスト（Issue #2 PoC）
├── bridge/      MAIN⇄ISOLATED の Promise ラッパ + イベント検証
├── dom/         selectors.ts（セレクタ定数を一元管理）/ chatworkDom.ts
└── types/       global.d.ts
```

### 重要な原則

- **セレクタは `src/dom/selectors.ts` に集約**。Chatwork 側の DOM 変更時はここだけ直す。
- **`innerHTML` を使わない**。UI は `createElement` 等の DOM API で構築する（XSS 対策）。
- **`ACCESS_TOKEN` 等の秘密情報をログ出力しない**。保存もしない。
- ショートカットは「テキスト in → テキスト out」の純粋関数にし、DOM 操作は
  `ChatworkDom` インターフェース経由でディスパッチャが実行する。
- 依存追加はバージョンを明示し、`package-lock.json` をコミットする。

## テスト方針

- **単体（Vitest）**: `src/` の純粋関数・ディスパッチャ・storage（`fakeBrowser`）。`happy-dom` 環境。
- **E2E（Playwright）**: `.output/chrome-mv3` を `--load-extension` でロードし、`page.route` で
  `chatwork.com` を本物の URL のままモック HTML（`e2e/fixtures/chatwork-mock.html`）に差し替える。
  URL ベースで content script の `matches` が発火する。
- **スモーク**: 実 Chatwork。認証情報（`playwright/.auth/`）は `.gitignore` 済み。CI 非対象。

## CI

`.github/workflows/ci.yml`: `npm ci` → compile / lint / format / vitest →
`playwright install chromium` → `wxt build` → `xvfb-run` で E2E。スモークは含めない。

## 既知の残課題

- **Issue #2（メンションサジェスト）**: 実 Chatwork DOM のセレクタ・TO 記法の挙動を
  スモートテストで検証する必要がある（`docs/issue-2-tolist-suggest-poc.md`）。
- **npm audit**: `wxt` → `web-ext-run` の dev 依存に既知脆弱性が残るが、拡張成果物には
  含まれない。上流の修正に追随する。
