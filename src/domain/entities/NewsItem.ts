/** ニュースの種別。バッジの色分けに使う(未知の値は announcement 扱い) */
export type NewsType = 'release' | 'maintenance' | 'announcement';

export interface NewsItem {
  readonly id: string;
  readonly type: NewsType;
  readonly publishDate: string; // ISO (YYYY-MM-DD)
  readonly expireDate: string | null;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly link?: string;
}

/** 掲載期限切れでないか(expireDate なしは常に有効) */
export function isActive(item: NewsItem, now: Date): boolean {
  if (item.expireDate === null) return true;
  return new Date(item.expireDate).getTime() >= now.getTime();
}
