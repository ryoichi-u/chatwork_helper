# Issue #2: toList サジェスト PoC 結果

- 対象 Issue: [#2 toListの動きでサジェストする動きを実現できないか？](https://github.com/ryoichi-u/chatwork_helper/issues/2)
- 結論: **実装可能**。本家 JS の無名関数に依存しない方式を確立した。

## 背景

Issue 本文より:

> toList から選ぶ動作が本家の JS の無名関数内の処理を介さないとキツくて諦めた。

旧アプローチは「toList の項目をプログラムからクリックして選択させる」ものだったため、
Chatwork 内部の無名関数（クロージャ）に依存せざるを得なかった。

## PoC で確立した方式

**Chatwork の TO タグ記法 `[To:{accountId}] {name}さん` をテキストとして入力欄へ直接挿入する。**

選択動作を本家 JS に委ねるのではなく、TO の「結果テキスト」を自前で組み立てて
`#_chatText` に挿入する。Chatwork は入力欄内の `[To:id]` 記法を TO として描画・送信
するため、内部関数を一切呼ばずに同等の結果が得られる。

### 実装構成

| ファイル                    | 役割                                                            |
| --------------------------- | --------------------------------------------------------------- |
| `src/suggest/toTag.ts`      | TO タグ生成・`@クエリ` 検出・メンバー絞り込み・置換（純粋関数） |
| `src/suggest/members.ts`    | TO リスト DOM からメンバー（accountId + 名前）を読み取る        |
| `src/suggest/dropdown.ts`   | サジェスト UI（DOM API 構築・innerHTML 不使用）                 |
| `src/suggest/controller.ts` | `@` 検出 → 候補表示 → ↑↓/Enter/Tab/Esc 操作 → TO タグ挿入       |

### 動作（モックページ E2E で検証済み）

- `@` 入力でルームメンバーのサジェストを表示
- クエリで絞り込み（名前・accountId、大文字小文字無視）
- クリック / ↓+Enter で確定 → `[To:111] 山田太郎さん ` を挿入
- 確定 Enter はショートカット判定へ伝播させない（改行・誤送信を防止）
- Esc で閉じる

## 残課題（実運用前にスモーク検証が必要）

PoC はモックページ（`e2e/fixtures/chatwork-mock.html`）で検証済み。本番投入前に
実 Chatwork DOM に対し以下をスモークテストで確認する:

1. **TO リストのセレクタ・属性名**: `src/dom/selectors.ts` の `toList` /
   `toListMember`（現状 `#_toList [data-account-id]`）が実 DOM と一致するか
2. **メンバー名の取得元**: `[class*="name"]` で名前が取れるか
3. **TO タグ記法**: `[To:{id}] {name}さん` が実際に TO として描画・送信されるか
4. **メンバー一覧の取得タイミング**: TO リストが未展開でも DOM にメンバーが
   存在するか（必要なら裏で一度 toList を開いて読む等の対応）

セレクタは `selectors.ts` に集約済みのため、実 DOM に合わせた修正は最小限で済む。
