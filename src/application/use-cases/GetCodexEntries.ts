import { ProjectRepository } from '@domain/repositories/ProjectRepository';
import { CodexCatalog } from '@domain/services/CodexCatalog';
import { CATEGORY_TYPE_LABEL, isFeatured } from '@domain/value-objects/FeaturedKind';
import { CodexEntryVM } from '../view-models/CodexEntryVM';

/**
 * ユースケース: 図鑑一覧を取得。
 * 見た目順(看板優先)、コデックス番号付き。
 */
export class GetCodexEntries {
  constructor(
    private projectRepo: ProjectRepository,
    private codexService: CodexCatalog
  ) {}

  async execute(lang: string): Promise<CodexEntryVM[]> {
    const projects = await this.projectRepo.getAll(lang);

    // 図鑑No.を採番
    const codexMapping = this.codexService.assignNumbers(projects);

    // ビューモデルに変換
    return projects
      .sort((a, b) => {
        // 看板優先、その他は codexMapping に従う
        const aNo = codexMapping.get(a.id)?.number ?? 999;
        const bNo = codexMapping.get(b.id)?.number ?? 999;
        return aNo - bNo;
      })
      .map((project) => {
        const codexNo = codexMapping.get(project.id);
        return {
          codexNo: codexNo?.toString() ?? 'No.000',
          id: project.id,
          title: project.title,
          category: CATEGORY_TYPE_LABEL[project.category],
          thumbnailUrl: project.thumbnailUrl,
          description: project.description,
          featured: isFeatured(project.featured),
          featuredBadge: project.featured !== 'none' ? this.getFeaturedBadge(project.featured) : undefined,
          installUrl: project.featured === 'appstore-published' ? project.installUrl : undefined,
        };
      });
  }

  private getFeaturedBadge(featured: string): string {
    return featured === 'appstore-published' ? 'PLAY NOW' : 'COMING SOON';
  }
}
