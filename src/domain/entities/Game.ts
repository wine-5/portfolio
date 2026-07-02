export type GameCategory = 'game' | 'web' | 'tool';

/** 配信ストア。バッジ表示に使う */
export type Store = 'app-store' | 'steam';

export type ReleaseState =
  | { kind: 'playable'; url: string; store?: Store }
  | { kind: 'coming-soon'; store?: Store }
  | { kind: 'archived' };

/** 図鑑に載る 1 作品。No. は図鑑上の通し番号 */
export interface Game {
  readonly entryNo: number;
  readonly title: string;
  readonly description: string;
  readonly detailedFeatures: string;
  readonly myResponsibilities: string;
  readonly technologies: readonly string[];
  readonly supportedPlatforms: readonly string[];
  readonly images: readonly string[];
  readonly thumbnailImage: string;
  readonly githubUrl?: string;
  readonly year: string;
  readonly category: GameCategory;
  readonly teamSize: string;
  readonly period: string;
  readonly release: ReleaseState;
  readonly featured: boolean;
}
