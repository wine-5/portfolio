import { SkillRepository } from '@domain/repositories/SkillRepository';
import { SkillSheetVM, SkillVM } from '../view-models/SkillVM';

/**
 * ユースケース: スキルシート一覧を取得。
 */
export class GetSkillSheet {
  constructor(private skillRepo: SkillRepository) {}

  async execute(lang: string): Promise<SkillSheetVM> {
    const skills = await this.skillRepo.getAll(lang);

    const skillVMs: SkillVM[] = skills.map((skill) => {
      const expLevel = skill.getExperienceLevel();
      return {
        id: skill.id,
        title: skill.title,
        additionalSkills: [...skill.additionalSkills],
        projects: skill.projects,
        proficiency: skill.proficiency,
        experienceText: expLevel.displayText,
        experiencePercent: expLevel.experiencePercent,
        level: expLevel.level,
      };
    });

    return { skills: skillVMs };
  }
}
