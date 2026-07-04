import type { Skill, SkillGroup } from '@domain/entities/Skill';
import { monthsSince } from '@domain/entities/Skill';
import type { SkillRepository } from '@application/ports/SkillRepository';
import type { Locale } from '@application/ports/Locale';

interface SkillDto {
  name: string;
  startDate: string;
  projects?: string;
  items?: string[];
  relatedGames?: string[];
}

interface SkillsFileDto {
  languages?: SkillDto[];
  tools?: SkillDto[];
}

export class JsonSkillRepository implements SkillRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly Skill[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/skills.json`);
    if (!res.ok) {
      throw new Error(`skills.json の取得に失敗しました (${res.status})`);
    }
    const dto = (await res.json()) as SkillsFileDto;
    const now = new Date();
    return [
      ...(dto.languages ?? []).map((s) => toSkill(s, 'language', now)),
      ...(dto.tools ?? []).map((s) => toSkill(s, 'tool', now)),
    ];
  }
}

function toSkill(dto: SkillDto, group: SkillGroup, now: Date): Skill {
  const months = monthsSince(dto.startDate, now);
  return {
    name: dto.name,
    group,
    startDate: dto.startDate,
    months,
    level: months,
    projects: dto.projects ?? '',
    items: dto.items ?? [],
    relatedGames: dto.relatedGames ?? [],
  };
}
