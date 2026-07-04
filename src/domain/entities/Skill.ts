/** スキルの区分。JSON のグループキーに対応 */
export type SkillGroup = 'language' | 'tool';

/**
 * Skills セクションの 1 スキル。レベルは経験月数から導出(経験月数=レベル)。
 * 月数は「実際に触っていた期間の固定値」か「開始日からの自動計算」のどちらかで決まる。
 */
export interface Skill {
  readonly name: string;
  readonly group: SkillGroup;
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
