import { Project } from '../entities/Project';
import { GameStat, calculateGameStat } from '../value-objects/GameStat';

/**
 * ドメインサービス: プロジェクト ゲーム統計計算。
 * Project のメタデータから RPG 的なステータスを導出。
 */
export class ProjectGameStatService {
  calculateStat(project: Project): GameStat {
    return calculateGameStat({
      teamSize: project.teamSize,
      durationDays: project.durationDays,
      technologyCount: Array.from(project.technologies).length,
      isAwarded: project.isAwarded,
    });
  }
}
