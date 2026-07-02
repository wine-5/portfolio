import type { Skill } from '@domain/entities/Skill';
import type { SkillRepository } from '../ports/SkillRepository';
import type { Locale } from '../ports/Locale';

/** Skills セクション(EXP バー)表示用。レベル降順で返す */
export class GetPlayerSkills {
  constructor(private readonly skills: SkillRepository) {}

  async execute(locale: Locale): Promise<readonly Skill[]> {
    const all = await this.skills.findAll(locale);
    return [...all].sort((a, b) => b.level - a.level);
  }
}
