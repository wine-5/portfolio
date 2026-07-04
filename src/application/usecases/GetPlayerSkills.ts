import type { Skill } from '@domain/entities/Skill';
import type { SkillRepository } from '../ports/SkillRepository';
import type { Locale } from '../ports/Locale';

export interface SkillMatrix {
  readonly languages: readonly Skill[];
  readonly tools: readonly Skill[];
}

/** Skills セクション表示用。グループごとに経験月数の降順で返す */
export class GetPlayerSkills {
  constructor(private readonly skills: SkillRepository) {}

  async execute(locale: Locale): Promise<SkillMatrix> {
    const all = await this.skills.findAll(locale);
    const byMonthsDesc = (a: Skill, b: Skill): number => b.months - a.months;
    return {
      languages: all.filter((s) => s.group === 'language').sort(byMonthsDesc),
      tools: all.filter((s) => s.group === 'tool').sort(byMonthsDesc),
    };
  }
}
