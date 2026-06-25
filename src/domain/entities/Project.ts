import type { Category } from '../value-objects/Category';
import type { FeaturedKind } from '../value-objects/FeaturedKind';
import { TechStack } from '../value-objects/TechStack';
import type { GameStat } from '../value-objects/GameStat';

/**
 * ゲーム作品エンティティ。
 * JSONデータから復元される、図鑑に載る個別作品。
 */
export class Project {
  constructor(
    readonly id: string, // title をベース(一意性は保証しない=Applicationで管理)
    readonly title: string,
    readonly description: string,
    readonly category: Category,
    readonly year: string, // "2年次" など
    readonly technologies: TechStack,
    readonly teamSize: number,
    readonly durationDays: number,
    readonly isAwarded: boolean,
    readonly imageUrls: readonly string[],
    readonly thumbnailUrl: string,
    readonly playUrl?: string,
    readonly githubUrl?: string,
    readonly installUrl?: string, // AppStore/Steam など
    readonly featured: FeaturedKind = 'none',
    readonly detailedFeatures?: string,
    readonly myResponsibilities?: string,
    readonly awardTitle?: string,
  ) {}

  /**
   * RPGステータスを算出(ドメインサービスから呼ばれる)。
   */
  calculateGameStat(): GameStat {
    return {
      difficulty: 3, // ダミー値(Serviceで計算)
      novelty: 3,
      quality: 3,
    };
  }
}
