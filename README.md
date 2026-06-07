# chatwork helper

Chatwork を便利にする Google Chrome 拡張機能です。

> **v3.0.0 より Manifest V3 + TypeScript（[WXT](https://wxt.dev/)）に全面リライトしました。**
> Manifest V2 は Chrome で廃止済みのため、現行 Chrome で動作するよう刷新しています。

## インストール

Chrome ウェブストア（v2 系）:
https://chrome.google.com/webstore/detail/chatworkhelper/ddejlbfddlhkoaomiocpbjmpnjkbcnkj

開発版を読み込む場合は [開発](#開発) を参照してください。

## 機能

### ショートカット（行頭で入力 + Enter）

| ショートカット  | 機能                                                  | 備考                               |
| --------------- | ----------------------------------------------------- | ---------------------------------- |
| `@@ + enter`    | 全員宛て `[toall]` を挿入                             |                                    |
| `:to + enter`   | TO リストを開く                                       | タスク作成欄では担当者リストを開く |
| `:file + enter` | ファイルアップロードを開く                            |                                    |
| `:f + enter`    | 検索窓へ移動                                          |                                    |
| `:task + enter` | 入力中の本文をタスク名へ移す                          |                                    |
| `:info + enter` | `[info][/info]` タグを挿入（`:title` / `:code` も可） | カーソルはタグの内側に入る (#3)    |
| `:me + enter`   | 自分宛て TO のメッセージのみ表示                      | フィルタ中バナーから解除可能 (#4)  |
| `:mine + enter` | 自分の送信メッセージのみ表示                          |                                    |
| `:all + enter`  | フィルタ解除（全メッセージ表示）                      |                                    |

ショートカット実行後はカーソル位置が保持されます（Issue #3）。

### 全既読ボタン

ルーム一覧の上部に「すべて既読」ボタンを追加します。クリックで未読ルームをまとめて既読化します。

### お気に入り・あとで読む（Issue #5）

- メッセージにマウスを乗せると「★ あとで読む」ボタンが表示され、クリックで保存できます。
- ルーム一覧ヘッダの ★ ボタンで保存一覧パネルを開き、クリックで該当メッセージへジャンプ／削除できます。
- 保存は `chrome.storage.local` に永続化されます（サーバー不要）。

### @ メンションサジェスト（Issue #2・PoC）

`@` を入力するとルームメンバーのサジェストが表示され、選択すると TO タグが挿入されます。
※実 Chatwork DOM での検証が残課題です（`docs/issue-2-tolist-suggest-poc.md` 参照）。

## アーキテクチャ

[WXT](https://wxt.dev/)（TypeScript / Vite / Manifest V3）で構築。content script は 2 層構成です。

| entrypoint                           | world    | 役割                                                                  |
| ------------------------------------ | -------- | --------------------------------------------------------------------- |
| `entrypoints/page-bridge.content.ts` | MAIN     | ページ変数（`MYID` / `ACCESS_TOKEN` 等）を読み CustomEvent で受け渡し |
| `entrypoints/helper.content.ts`      | ISOLATED | ショートカット・全既読・お気に入り・サジェストの本体                  |

ロジックは `src/` 配下の純粋関数に分離し、DOM 副作用は薄いインターフェース経由で実行することで Vitest によるテストを可能にしています。詳細は [CLAUDE.md](./CLAUDE.md) を参照。

## 開発

```bash
npm ci              # 依存インストール（lockfile 厳密再現）
npm run dev         # 開発用に Chrome を起動して拡張をロード
npm run build       # 本番ビルド（.output/chrome-mv3）
npm run zip         # Chrome Web Store 用 zip を生成
```

### テスト

```bash
npm test            # Vitest（純粋ロジックの単体テスト）
npm run test:e2e    # Playwright E2E（モックページ + 拡張ロード）
npm run test:e2e:headed  # ブラウザ表示つき E2E
```

E2E は `page.route` で Chatwork のページを本物の URL のままモック HTML に差し替えてテストします。

### 実 Chatwork スモークテスト（ローカル専用）

```bash
npm run smoke:auth  # ブラウザでログイン → 認証情報を保存（.gitignore 済み）
npm run smoke       # 実 Chatwork で非破壊系のみ検証
```

詳細なビルド・テストコマンドは [CLAUDE.md](./CLAUDE.md) を参照してください。
