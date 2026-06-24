/**
 * 看板作品の種別(値オブジェクト)。
 * AppStore公開済み / Store公開予定 / なし
 */
export type FeaturedKind = 'appstore-published' | 'store-coming-soon' | 'none';

export const FEATURED_KIND_LABEL: Record<FeaturedKind, string> = {
  'appstore-published': 'PLAY NOW',
  'store-coming-soon': 'COMING SOON',
  'none': '',
};

export function isFeatured(kind: FeaturedKind): boolean {
  return kind !== 'none';
}

export function getFeaturedBadgeLabel(kind: FeaturedKind): string {
  switch (kind) {
    case 'appstore-published':
      return 'PLAY NOW';
    case 'store-coming-soon':
      return 'COMING SOON';
    default:
      return '';
  }
}
