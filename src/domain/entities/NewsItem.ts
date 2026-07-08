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
  /** 関連ゲームの githubUrl(言語非依存キー)。指定時はクリックで図鑑の該当カードへ移動 */
  readonly gameUrl?: string;
}

/** ローカルタイムの YYYY-MM-DD 文字列に変換する */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 公開日を迎えており、かつ掲載期限切れでないか(expireDate なしは期限なし) */
export function isActive(item: NewsItem, now: Date): boolean {
  if (item.publishDate > toLocalDateString(now)) return false;
  if (item.expireDate === null) return true;
  return new Date(item.expireDate).getTime() >= now.getTime();
}
