import type { Skill, SkillGroup } from '@domain/entities/Skill';
import { monthsSince } from '@domain/entities/Skill';
import type { SkillRepository } from '@application/ports/SkillRepository';
import type { Locale } from '@application/ports/Locale';

interface SkillDto {
  name: string;
  /** 実際に触っていた期間(月数)。指定時はこちらが優先(過去に使っていたスキル向け) */
  months?: number;
  /** 開始日。months 未指定ならここから自動計算(現役で使い続けているスキル向け) */
  startDate?: string;
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
  const months = dto.months ?? (dto.startDate ? monthsSince(dto.startDate, now) : 1);
  return {
    name: dto.name,
    group,
    months,
    level: months,
    projects: dto.projects ?? '',
    items: dto.items ?? [],
    relatedGames: dto.relatedGames ?? [],
  };
}
