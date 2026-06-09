/** タグ展開に対応するタグ名（`:info` → `[info]\n[/info]` など） */
export const EXPANDABLE_TAGS = ['info', 'title', 'code'] as const;

export type ExpandableTag = (typeof EXPANDABLE_TAGS)[number];

/** 最初の `:tag` を `[tag]\n[/tag]` に展開する */
export function expandTag(text: string, tag: ExpandableTag): string {
  return text.replace(`:${tag}`, `[${tag}]\n[/${tag}]`);
}
