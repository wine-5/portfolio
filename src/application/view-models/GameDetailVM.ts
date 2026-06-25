/**
 * ビューモデル: ゲーム作品の詳細情報。
 * GameStatusModal / 詳細表示用。
 */
export interface GameStat {
  difficulty: number;
  novelty: number;
  quality: number;
}

export interface GameDetailVM {
  codexNo: string;
  title: string;
  category: string;
  year: string;
  description: string;
  detailedFeatures: string;
  myResponsibilities: string;
  technologies: string[];
  teamSize: number;
  durationDays: number;
  imageUrls: string[];
  playUrl?: string;
  githubUrl?: string;
  installUrl?: string;

  // RPGステータス表示
  stat: GameStat;

  // 受賞・看板フラグ
  isAwarded: boolean;
  awardTitle?: string;
  featuredBadge?: string;
}
