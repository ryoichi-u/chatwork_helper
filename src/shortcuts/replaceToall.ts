/** 最初の `@@`（全角混在可）を `[toall]` に置換する */
export function replaceToall(text: string): string {
  return text.replace(/[@＠]{2}/, '[toall]');
}
