/** HP/MP のようなゲージ 1 本分 */
export interface Gauge {
  readonly label: string;
  readonly current: number;
  readonly max: number;
}

export interface ProfileLink {
  readonly label: string;
  readonly url: string;
}

/** About セクションで主人公キャラとして表示する本人情報 */
export interface Profile {
  readonly name: string;
  readonly job: string;
  readonly description: string;
  readonly avatar: string;
  readonly hp: Gauge;
  readonly mp: Gauge;
  readonly expLabel: string;
  readonly expLanguages: readonly string[];
  readonly links: readonly ProfileLink[];
}

export function gaugePercent(g: Gauge): number {
  if (g.max <= 0) return 0;
  return Math.min(100, Math.max(0, (g.current / g.max) * 100));
}
