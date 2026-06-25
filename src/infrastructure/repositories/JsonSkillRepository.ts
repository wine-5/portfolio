import type { SkillRepository } from '@domain/repositories/SkillRepository';
import { Skill } from '@domain/entities/Skill';

/**
 * 実装: JSON ベースのスキルリポジトリ。
 */
export class JsonSkillRepository implements SkillRepository {
  // スキル開始日マッピング(固定値)
  private skillStartDates: Record<string, string> = {
    unity: '2024-04-18',
    'c#': '2024-04-18',
    git: '2024-10-18',
    'c++': '2026-01-18',
    css: '2024-04-18',
    js: '2024-04-18',
    javascript: '2024-04-18',
    typescript: '2026-03-18',
    ts: '2026-03-18',
    ci: '2026-03-18',
  };

  async getAll(lang: string): Promise<Skill[]> {
    const data = await this.fetchJson(`/portfolio/data/locales/${lang}/skillDetails.json`);
    if (!data || typeof data !== 'object') return [];

    return Object.entries(data).map(([id, skillData]: [string, any]) => {
      const skill = new Skill(
        id,
        skillData.title,
        skillData.proficiency ?? '0%',
        skillData.additionalSkills ?? [],
        skillData.projects ?? ''
      );

      // 経験月数を設定
      const experienceMonths = this.calculateExperienceMonths(id);
      skill.setExperienceMonths(experienceMonths);

      return skill;
    });
  }

  async getById(id: string, lang: string): Promise<Skill | null> {
    const skills = await this.getAll(lang);
    return skills.find((s) => s.id === id) ?? null;
  }

  private calculateExperienceMonths(skillId: string): number {
    const startDate = this.skillStartDates[skillId.toLowerCase()] || '2024-04-18';
    const start = new Date(startDate);
    const now = new Date();

    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();

    return years * 12 + Math.max(0, months);
  }

  private async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return response.json();
    } catch (e) {
      console.error('JsonSkillRepository:', e);
      return {};
    }
  }
}
