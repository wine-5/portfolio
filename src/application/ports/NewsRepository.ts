import type { NewsItem } from '@domain/entities/NewsItem';
import type { Locale } from './Locale';

/** ニュースデータの取得口。実装は infrastructure 層 */
export interface NewsRepository {
  findAll(locale: Locale): Promise<readonly NewsItem[]>;
}
