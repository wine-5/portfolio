import type { ProjectRepository } from '@domain/repositories/ProjectRepository';
import { ProjectGameStatService } from '@domain/services/ProjectGameStatService';
import { CodexCatalog } from '@domain/services/CodexCatalog';
import type { GameDetailVM } from '../view-models/GameDetailVM';
import { CATEGORY_TYPE_LABEL } from '@domain/value-objects/Category';

/**
 * ユースケース: 単一ゲームの詳細情報を取得。
 */
export class GetGameDetail {
  constructor(
    private projectRepo: ProjectRepository,
    private statService: ProjectGameStatService,
    private codexService: CodexCatalog
  ) {}

  async execute(projectId: string, lang: string): Promise<GameDetailVM | null> {
    const project = await this.projectRepo.getById(projectId, lang);
    if (!project) return null;

    const projects = await this.projectRepo.getAll(lang);
    const codexMapping = this.codexService.assignNumbers(projects);
    const codexNo = codexMapping.get(projectId);

    const stat = this.statService.calculateStat(project);

    return {
      codexNo: codexNo?.toString() ?? 'No.000',
      title: project.title,
      category: CATEGORY_TYPE_LABEL[project.category],
      year: project.year,
      description: project.description,
      detailedFeatures: project.detailedFeatures ?? '',
      myResponsibilities: project.myResponsibilities ?? '',
      technologies: Array.from(project.technologies),
      teamSize: project.teamSize,
      durationDays: project.durationDays,
      imageUrls: [...project.imageUrls],
      playUrl: project.playUrl,
      githubUrl: project.githubUrl,
      installUrl: project.installUrl,
      stat,
      isAwarded: project.isAwarded,
      featuredBadge: project.featured === 'appstore-published' ? 'PLAY NOW' : project.featured === 'store-coming-soon' ? 'COMING SOON' : undefined,
    };
  }
}
