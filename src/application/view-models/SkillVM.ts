/**
 * ビューモデル: スキル行。
 */
export interface SkillVM {
  id: string;
  title: string;
  additionalSkills: string[];
  projects: string;
  proficiency: string;

  // Experience に由来
  experienceText: string;       // "2年3ヶ月"
  experiencePercent: number;    // 0～100
  level: number;                // 0～48
}

/**
 * ビューモデル: スキルシート全体。
 */
export interface SkillSheetVM {
  skills: SkillVM[];
}
