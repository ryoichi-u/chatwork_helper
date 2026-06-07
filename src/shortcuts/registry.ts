import { replaceToall } from './replaceToall';
import { stripCommand } from './stripCommand';
import { extractTaskName } from './moveToTask';
import type { Shortcut } from './types';

/**
 * チャット入力欄のショートカット一覧（旧 chatworkHelper.js の shortcutConf を移植）。
 * 配列の順序は判定順序として意味を持つ（`:file` を `:f` より先に処理する等）。
 */
export const chatShortcuts: Shortcut[] = [
  {
    // 全員宛て [toall] の短縮形
    key: '[@＠]{2}',
    run(dom) {
      dom.setChatText(replaceToall(dom.getChatText()));
      dom.focusChatText();
    },
  },
  {
    // TO リストを開く
    key: ':to',
    run(dom) {
      dom.openToList();
      dom.setChatText(stripCommand(dom.getChatText(), ':to'));
    },
  },
  {
    // ファイルアップロードを開く
    key: ':file',
    run(dom) {
      dom.openFileUpload();
      dom.setChatText(stripCommand(dom.getChatText(), ':file'));
    },
  },
  {
    // 検索ボックスへフォーカス移動
    key: ':f',
    run(dom) {
      dom.focusSearch();
      dom.setChatText(stripCommand(dom.getChatText(), ':f'));
    },
  },
  {
    // 自分宛て TO のメッセージのみ表示
    key: ':me',
    run(dom) {
      dom.filterMessages('me');
      dom.setChatText(stripCommand(dom.getChatText(), ':me'));
    },
  },
  {
    // 自分の送信メッセージのみ表示
    key: ':mine',
    run(dom) {
      dom.filterMessages('mine');
      dom.setChatText(stripCommand(dom.getChatText(), ':mine'));
    },
  },
  {
    // フィルタ解除（全メッセージ表示）
    key: ':all',
    run(dom) {
      dom.filterMessages('all');
      dom.setChatText(stripCommand(dom.getChatText(), ':all'));
    },
  },
  {
    // 入力中の本文をタスク名入力欄へ移す
    key: ':task',
    run(dom) {
      dom.setTaskText(extractTaskName(dom.getChatText()));
      dom.setChatText('');
      dom.focusTaskInput();
    },
  },
];

/**
 * タスク名入力欄のショートカット。
 * 旧実装ではチャット欄の shortcutConf に紛れていた（かつ openTaskAssigneeList が
 * 未定義で ReferenceError になる潜在バグがあった）が、README の仕様どおり
 * 「タスク入力欄で :to + Enter → 担当者リストを開く」として分離・修正した。
 */
export const taskShortcuts: Shortcut[] = [
  {
    key: ':to',
    run(dom) {
      dom.openAssigneeList();
      dom.setTaskText(stripCommand(dom.getTaskText(), ':to'));
    },
  },
];
