import { Project } from '../entities/Project';
import { CodexNo } from '../value-objects/CodexNo';

/**
 * ドメインサービス: 図鑑No.採番。
 * プロジェクトリストを受け取り、図鑑順序を決定してNo.を振る。
 */
export class CodexCatalog {
  /**
   * プロジェクトリストに対し、定められた順序で CodexNo を割り当てる。
   * 見た目の優先順位: 看板作品(featured) → カテゴリ(game > web-game > web) → 年度
   */
  assignNumbers(projects: Project[]): Map<string, CodexNo> {
    const mapping = new Map<string, CodexNo>();

    // ソート: 看板作品優先、その他はカテゴリ・年度順
    const categoryOrder = { game: 0, 'web-game': 1, web: 2 };
    const sorted = [...projects].sort((a, b) => {
      // 看板作品を前に
      const aFeatured = a.featured !== 'none' ? 0 : 1;
      const bFeatured = b.featured !== 'none' ? 0 : 1;
      if (aFeatured !== bFeatured) return aFeatured - bFeatured;

      // カテゴリ順
      const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (catDiff !== 0) return catDiff;

      // 年度順(新しい順, "2年次" → 年度数抽出)
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    });

    // No.を割り当て
    sorted.forEach((project, index) => {
      mapping.set(project.id, new CodexNo(index + 1));
    });

    return mapping;
  }
}
