/**
 * ゲーム作品のRPG的なステータス(値オブジェクト)。
 * チーム規模・期間・技術数・受賞などから自動算出。
 * UI表示: ATK(攻撃), INT(知能), SPD(速度) 的なバーで表現。
 */
export interface GameStat {
  difficulty: number;      // ★★★ の「難易度」スター数(1～5)
  novelty: number;         // 新規性・創意工夫(1～5)
  quality: number;         // 品質・完成度(1～5)
}

export function calculateGameStat(params: {
  teamSize: number;        // 人数
  durationDays: number;    // 期間(日数)
  technologyCount: number; // 使用技術数
  isAwarded: boolean;      // 受賞歴あり
}): GameStat {
  const { teamSize, durationDays, technologyCount, isAwarded } = params;

  // difficulty: 期間が短いほど、チームが大きいほど高い
  const difficultySafe = Math.min(
    5,
    Math.max(1, Math.ceil((teamSize * 30) / Math.max(durationDays, 1)))
  );

  // novelty: 技術数が多いほど、受賞していたら+1
  const noveltyBase = Math.min(5, Math.max(1, Math.ceil(technologyCount / 2)));
  const novelty = isAwarded && noveltyBase < 5 ? noveltyBase + 1 : noveltyBase;

  // quality: 期間が長いほど、チームサイズがバランス(2～3人)ほど高い
  const qualityDuration = Math.min(5, durationDays / 20);
  const qualityTeam = Math.abs(teamSize - 2.5) < 1 ? 1.5 : 1;
  const quality = Math.min(5, Math.max(1, Math.ceil(qualityDuration * qualityTeam)));

  return {
    difficulty: Math.round(difficultySafe),
    novelty: Math.round(novelty),
    quality: Math.round(quality),
  };
}
