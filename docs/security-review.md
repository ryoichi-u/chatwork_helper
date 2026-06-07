# セキュリティレビュー（v3 リライト）

- 対象: WXT + TypeScript（MV3）リライト（Phase 1〜3）
- 実施日: 2026-06-08
- 手法: `/security-review` スキル（サブエージェントによる脆弱性特定 → 偽陽性フィルタ）+ 手動の多角レビュー
- 結論: **新規追加された重大な脆弱性は検出されなかった**

## 旧版（v2.3.0 / MV2）から解消された既知リスク

| 項目                       | 旧版の問題                                                                                                    | v3 での解消                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| リモートコード実行         | protocol-relative URL（`//ajax.googleapis.com/...`）で jQuery を動的注入。MITM でコード差し替え可能、MV3 違反 | CDN 注入を全廃。バンドル済みコードのみ実行（`document_idle` + MutationObserver） |
| 脆弱な依存                 | jQuery 3.3.1 を同梱（CVE-2020-11022 / 11023 等、XSS）                                                         | jQuery 全廃                                                                      |
| `$()` への HTML 文字列渡し | jQuery 経由の DOM 構築                                                                                        | DOM API（`createElement` 等）のみ。`innerHTML` 不使用                            |

## 新規コードの観点と判定

| #   | 観点                                                                                        | 該当箇所                                                                                  | 判定                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | MAIN⇄ISOLATED CustomEvent のメッセージ検証（第三者スクリプトによる ACCESS_TOKEN 窃取/偽装） | `entrypoints/page-bridge.content.ts`, `src/bridge/credentials.ts`, `src/bridge/events.ts` | **安全**。要求イベント（ISOLATED→MAIN）はペイロードを持たず、秘密情報をページ方向へ送らない。応答イベントが運ぶ `ACCESS_TOKEN` は元々 `window.ACCESS_TOKEN` でページ上の全スクリプトが直接読める値であり、ブリッジによる新規露出はない。悪意あるページスクリプトが応答イベントを偽造してトークンを差し替えても、用途は同一オリジン `gateway.php` への POST に限られ、これはページスクリプトが自前で実行可能な操作と等価。権限昇格・情報窃取は発生しない |
| 2   | ACCESS_TOKEN の取り扱い（ログ出力・スコープ）                                               | `src/allread/markRoomRead.ts`, `entrypoints/helper.content.ts`                            | **安全**。トークンは同一オリジン POST のボディ（`_t`）にのみ使用。エラーメッセージはステータスと `room_id` のみでトークンを含めない。資格情報の `console.log` は存在しない                                                                                                                                                                                                                                                                              |
| 3   | SSRF / fetch のホスト・プロトコル制御                                                       | `src/allread/markRoomRead.ts`                                                             | **安全**。ホストは `window.location.hostname`（ブラウザ制御、ページスクリプトから変更不可）、プロトコルは `https` ハードコード。パスのみ固定で、ホスト・プロトコルは攻撃者制御不可                                                                                                                                                                                                                                                                      |
| 4   | DOM-based XSS（`innerHTML` 等）                                                             | `src/allread/button.ts`, `src/allread/findUnreadRooms.ts`                                 | **安全**。ボタンは `createElement` / `createElementNS` / `setAttribute` / `appendChild` で構築（`innerHTML` 不使用）。`roomId` をセレクタへ補間する箇所は `CSS.escape()` でエスケープ                                                                                                                                                                                                                                                                   |
| 5   | manifest 権限の最小化                                                                       | `wxt.config.ts`, content scripts                                                          | **安全**。`matches` は `https://www.chatwork.com/*` と `https://kcw.kddi.ne.jp/*` のみ。`<all_urls>` / `host_permissions` / `storage` / `tabs` / `web_accessible_resources` のいずれも未使用                                                                                                                                                                                                                                                            |
| 6   | ショートカット / メッセージフィルタ / タグ展開                                              | `src/shortcuts/*`                                                                         | **安全**。`textarea.value` と `style.display` のみを操作し HTML シンクなし。トリガ正規表現は固定の registry キーを補間しており、ユーザー入力を正規表現に渡さない                                                                                                                                                                                                                                                                                        |

## 留意事項

- **開発依存の脆弱性**: `wxt` → `web-ext-run` の依存チェーンに既知の脆弱性（`tmp` / `uuid` / `node-notifier`）が残るが、いずれも dev-only で拡張機能の成果物（`.output/`）には含まれない。上流（wxt）の修正に追随する。
- **スモークテストの認証情報**: 実 Chatwork スモークで保存する `playwright/.auth/chatwork.json` は `.gitignore` で除外済み。公開リポジトリのため `.env` も同様に除外し、`.env.example` のみコミットする。

## Phase 5 以降への申し送り

- Issue #5（お気に入り）で `chrome.storage.local` と `permissions: ["storage"]` を追加予定。保存データはメッセージ ID / 本文 / ルーム ID のみとし、トークン等の秘密情報は保存しないこと。
- Issue #2（toList サジェスト）でルームメンバー情報をページ DOM から取得する際も、表示は DOM API で構築し `innerHTML` を避けること。
