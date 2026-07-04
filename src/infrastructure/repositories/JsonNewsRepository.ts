import type { NewsItem, NewsType } from '@domain/entities/NewsItem';
import type { NewsRepository } from '@application/ports/NewsRepository';
import type { Locale } from '@application/ports/Locale';

interface NewsDto {
  id: string;
  type?: string;
  publishDate: string;
  expireDate?: string | null;
  title: string;
  description: string;
  icon?: string;
  link?: string;
  gameUrl?: string;
}

const KNOWN_TYPES: readonly NewsType[] = ['release', 'maintenance', 'announcement'];

export class JsonNewsRepository implements NewsRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly NewsItem[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/news.json`);
    if (!res.ok) {
      throw new Error(`news.json の取得に失敗しました (${res.status})`);
    }
    const dtos = (await res.json()) as NewsDto[];
    return dtos.map((dto) => ({
      id: dto.id,
      type: (KNOWN_TYPES as readonly string[]).includes(dto.type ?? '')
        ? (dto.type as NewsType)
        : 'announcement',
      publishDate: dto.publishDate,
      expireDate: dto.expireDate ?? null,
      title: dto.title,
      description: dto.description,
      icon: dto.icon ?? '',
      ...(dto.link !== undefined ? { link: dto.link } : {}),
      ...(dto.gameUrl !== undefined ? { gameUrl: dto.gameUrl } : {}),
    }));
  }
}
