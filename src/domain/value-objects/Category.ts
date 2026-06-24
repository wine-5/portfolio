/**
 * 作品カテゴリー(ドメイン値オブジェクト)。
 * 図鑑のタイプ分け(ぞくせい)として扱う。
 */
export type Category = 'game' | 'web' | 'web-game';

export const CATEGORY_ORDER: readonly Category[] = ['game', 'web-game', 'web'] as const;

/** RPG世界での「ぞくせい」表示名(i18nキーではなく既定ラベル) */
export const CATEGORY_TYPE_LABEL: Record<Category, string> = {
  game: 'ゲーム',
  'web-game': 'Webゲーム',
  web: 'Webツール',
};

export function isCategory(value: unknown): value is Category {
  return value === 'game' || value === 'web' || value === 'web-game';
}
