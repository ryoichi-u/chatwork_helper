/** テキストから最初のコマンド文字列（`:to` など）を取り除く */
export function stripCommand(text: string, command: string): string {
  return text.replace(command, '');
}
