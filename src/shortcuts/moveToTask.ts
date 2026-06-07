/** `:task` コマンドを除いた本文をタスク名として取り出す */
export function extractTaskName(chatText: string): string {
  return chatText.replace(/:task/, '');
}
