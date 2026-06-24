/**
 * 経験レベル(値オブジェクト)。
 * 経験月数(0～48+)をレベル・EXP%に変換。
 */
export interface ExperienceLevel {
  totalMonths: number;
  level: number;
  experiencePercent: number;
  displayText: string;
}

const MAX_MONTHS = 48; // 学生時代4年間

/**
 * 経験月数からレベルと進捗を導出。
 */
export function calculateExperienceLevel(totalMonths: number): ExperienceLevel {
  const level = Math.min(totalMonths, MAX_MONTHS);
  const experiencePercent = Math.round((totalMonths / MAX_MONTHS) * 100);

  // displayText の計算
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  let displayText: string;

  if (years === 0) {
    displayText = months > 0 ? `${months}ヶ月` : '0ヶ月';
  } else if (months === 0) {
    displayText = `${years}年`;
  } else {
    displayText = `${years}年${months}ヶ月`;
  }

  return {
    totalMonths,
    level,
    experiencePercent: Math.min(experiencePercent, 100),
    displayText,
  };
}
