/** 図鑑詳細画面に表示する RPG 風ステータス(1〜99) */
export interface GameStats {
  readonly atk: number;
  readonly def: number;
  readonly int: number;
  readonly agi: number;
  readonly luk: number;
}

export const STAT_MAX = 99;
export const STAT_MIN = 1;

export function clampStat(value: number): number {
  return Math.min(STAT_MAX, Math.max(STAT_MIN, Math.round(value)));
}
