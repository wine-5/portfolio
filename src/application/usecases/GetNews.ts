import type { NewsItem } from '@domain/entities/NewsItem';
import { isActive } from '@domain/entities/NewsItem';
import type { NewsRepository } from '../ports/NewsRepository';
import type { Locale } from '../ports/Locale';

/** 掲載期限内のニュースを新しい順で返す */
export class GetNews {
  constructor(private readonly news: NewsRepository) {}

  async execute(locale: Locale, now: Date = new Date()): Promise<readonly NewsItem[]> {
    const all = await this.news.findAll(locale);
    return [...all]
      .filter((n) => isActive(n, now))
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  }
}
