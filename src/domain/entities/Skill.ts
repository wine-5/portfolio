/** スキルの区分。JSON のグループキーに対応 */
export type SkillGroup = 'language' | 'tool';

/** Skills セクションの 1 スキル。レベルは経験月数から導出(経験月数=レベル) */
export interface Skill {
  readonly name: string;
  readonly group: SkillGroup;
  readonly startDate: string; // YYYY-MM-DD
  readonly months: number;
  readonly level: number;
  readonly projects: string;
  readonly items: readonly string[];
  /** 関連作品の githubUrl(言語非依存キー)。図鑑カードへのリンクに使う */
  readonly relatedGames: readonly string[];
}

/** 開始日から現在までの経験月数(最低 1) */
export function monthsSince(startDate: string, now: Date): number {
  const start = new Date(startDate);
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;
  return Math.max(1, months);
}
