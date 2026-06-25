import type { ProjectRepository } from '@domain/repositories/ProjectRepository';
import { Project } from '@domain/entities/Project';
import { TechStack } from '@domain/value-objects/TechStack';
import type { Category } from '@domain/value-objects/Category';

/**
 * 実装: JSON ファイルベースのプロジェクトリポジトリ。
 */
export class JsonProjectRepository implements ProjectRepository {
  async getAll(lang: string): Promise<Project[]> {
    const data = await this.fetchJson(`/portfolio/data/locales/${lang}/projects.json`);
    if (!Array.isArray(data)) return [];

    return data.map((raw: any) => this.mapToProject(raw));
  }

  async getById(id: string, lang: string): Promise<Project | null> {
    const projects = await this.getAll(lang);
    return projects.find((p) => p.id === id) ?? null;
  }

  private mapToProject(raw: any): Project {
    const isAwarded = !!raw.award || !!raw.isAwarded;
    const featured = this.determineFeatured(raw);

    return new Project(
      raw.title, // ID as title
      raw.title,
      raw.description,
      raw.category as Category,
      raw.year,
      new TechStack(raw.technologies ?? []),
      raw.teamSize ?? 1,
      this.parseDuration(raw.period ?? ''),
      isAwarded,
      raw.images ?? [],
      raw.thumbnailImage,
      raw.playUrl,
      raw.githubUrl,
      raw.install,
      featured,
      raw.detailedFeatures,
      raw.myResponsibilities,
      raw.award
    );
  }

  private determineFeatured(raw: any): 'appstore-published' | 'store-coming-soon' | 'none' {
    // install が apps.apple.com なら AppStore 公開済み
    if (raw.install?.includes('apps.apple.com')) return 'appstore-published';
    // タイトルが '蝶々反乱' なら Store 公開予定
    if (raw.title?.includes('蝶')) return 'store-coming-soon';
    return 'none';
  }

  private parseDuration(periodStr: string): number {
    // "2日間", "3日間" → 日数
    const match = periodStr.match(/(\d+)\D*日/);
    return match ? parseInt(match[1]) : 1;
  }

  private async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return response.json();
    } catch (e) {
      console.error('JsonProjectRepository:', e);
      return [];
    }
  }
}
