import type { Skill } from '@domain/entities/Skill';
import type { SkillRepository } from '../ports/SkillRepository';
import type { Locale } from '../ports/Locale';

export interface SkillMatrix {
  readonly languages: readonly Skill[];
  readonly tools: readonly Skill[];
}

/** Skills セクション表示用。並び順は JSON の記載順(=ゲーム制作での重要度順)を保つ */
export class GetPlayerSkills {
  constructor(private readonly skills: SkillRepository) {}

  async execute(locale: Locale): Promise<SkillMatrix> {
    const all = await this.skills.findAll(locale);
    return {
      languages: all.filter((s) => s.group === 'language'),
      tools: all.filter((s) => s.group === 'tool'),
    };
  }
}
