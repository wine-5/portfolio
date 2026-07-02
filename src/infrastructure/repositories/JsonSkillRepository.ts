import type { Skill } from '@domain/entities/Skill';
import type { SkillRepository } from '@application/ports/SkillRepository';
import type { Locale } from '@application/ports/Locale';

interface SkillDto {
  title: string;
  additionalSkills?: string[];
  projects?: string;
  proficiency?: string; // "70%" 形式
}

export class JsonSkillRepository implements SkillRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly Skill[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/skillDetails.json`);
    if (!res.ok) {
      throw new Error(`skillDetails.json の取得に失敗しました (${res.status})`);
    }
    const dtos = (await res.json()) as Record<string, SkillDto>;
    return Object.entries(dtos).map(([id, dto]) => {
      const proficiency = Number.parseInt(dto.proficiency ?? '0', 10) || 0;
      return {
        id,
        title: dto.title,
        additionalSkills: dto.additionalSkills ?? [],
        projects: dto.projects ?? '',
        proficiency,
        level: Math.max(1, Math.round(proficiency * 0.99)),
      };
    });
  }
}
