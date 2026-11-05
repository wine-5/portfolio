import type { Engine } from '@domain/entities/Engine';
import type { EngineRepository } from '@application/ports/EngineRepository';
import type { Locale } from '@application/ports/Locale';

/** public/data/locales/{locale}/engine.json の中身 */
interface EngineDto {
  name: string;
  status: string;
  motto: string;
  tagline: string;
  summary: string;
  pillars?: { title: string; body: string }[];
  tags?: string[];
  figures?: { src: string; caption: string }[];
  works?: string[];
}

export class JsonEngineRepository implements EngineRepository {
  constructor(private readonly baseUrl: string) {}

  async find(locale: Locale): Promise<Engine> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/engine.json`);
    if (!res.ok) {
      throw new Error(`engine.json の取得に失敗しました (${res.status})`);
    }
    const dto = (await res.json()) as EngineDto;
    return {
      name: dto.name,
      status: dto.status,
      motto: dto.motto,
      tagline: dto.tagline,
      summary: dto.summary,
      pillars: dto.pillars ?? [],
      tags: dto.tags ?? [],
      figures: dto.figures ?? [],
      works: dto.works ?? [],
    };
  }
}
