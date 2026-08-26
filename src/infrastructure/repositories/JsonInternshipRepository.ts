import type { Internship } from '@domain/entities/Internship';
import type { InternshipRepository } from '@application/ports/InternshipRepository';
import type { Locale } from '@application/ports/Locale';

interface InternshipDto {
  id: string;
  company: string;
  period: string;
  theme: string;
  summary: string;
  tags?: string[];
  learnings?: { title: string; body: string }[];
}

export class JsonInternshipRepository implements InternshipRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly Internship[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/internships.json`);
    if (!res.ok) {
      throw new Error(`internships.json の取得に失敗しました (${res.status})`);
    }
    const dtos = (await res.json()) as InternshipDto[];
    return dtos.map((dto) => ({
      id: dto.id,
      company: dto.company,
      period: dto.period,
      theme: dto.theme,
      summary: dto.summary,
      tags: dto.tags ?? [],
      learnings: dto.learnings ?? [],
    }));
  }
}
