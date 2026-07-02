import type { Game, GameCategory, ReleaseState } from '@domain/entities/Game';
import { deriveGameStats } from '@domain/services/deriveGameStats';
import type { GameRepository } from '@application/ports/GameRepository';
import type { Locale } from '@application/ports/Locale';

/** public/data/locales/{locale}/projects.json の 1 レコード */
interface ProjectDto {
  title: string;
  description: string;
  detailedFeatures?: string;
  myResponsibilities?: string;
  technologies?: string[];
  supportedPlatforms?: string[];
  images?: string[];
  thumbnailImage?: string;
  playUrl?: string;
  install?: string;
  githubUrl?: string;
  year?: string;
  category?: string;
  teamSize?: string;
  period?: string;
  award?: string;
}

/**
 * FEATURED(別格表示)作品。バッジは仕様で固定:
 * TofuRunner = AppStore 公開済み(PLAY NOW)、蝶々反乱 = Store 公開予定(COMING SOON)
 */
const FEATURED_RELEASE: Record<string, ReleaseState> = {
  TofuRunner: {
    kind: 'playable',
    url: 'https://apps.apple.com/jp/app/tofurunner/id6755136719',
  },
  蝶々反乱: { kind: 'coming-soon' },
};

export class JsonGameRepository implements GameRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly Game[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/projects.json`);
    if (!res.ok) {
      throw new Error(`projects.json の取得に失敗しました (${res.status})`);
    }
    const dtos = (await res.json()) as ProjectDto[];
    return dtos.map((dto, i) => this.toGame(dto, i + 1));
  }

  private toGame(dto: ProjectDto, entryNo: number): Game {
    const featuredRelease = FEATURED_RELEASE[dto.title];
    const release: ReleaseState =
      featuredRelease ??
      (dto.install || dto.playUrl
        ? { kind: 'playable', url: (dto.install ?? dto.playUrl)! }
        : { kind: 'archived' });

    return {
      entryNo,
      title: dto.title,
      description: dto.description,
      detailedFeatures: dto.detailedFeatures ?? '',
      myResponsibilities: dto.myResponsibilities ?? '',
      technologies: dto.technologies ?? [],
      supportedPlatforms: dto.supportedPlatforms ?? [],
      images: dto.images ?? [],
      thumbnailImage: dto.thumbnailImage ?? '',
      ...(dto.githubUrl !== undefined ? { githubUrl: dto.githubUrl } : {}),
      year: dto.year ?? '',
      category: (dto.category ?? 'game') as GameCategory,
      teamSize: dto.teamSize ?? '',
      period: dto.period ?? '',
      release,
      featured: featuredRelease !== undefined,
      stats: deriveGameStats({
        title: dto.title,
        detailedFeatures: dto.detailedFeatures ?? '',
        myResponsibilities: dto.myResponsibilities ?? '',
        technologies: dto.technologies ?? [],
        supportedPlatforms: dto.supportedPlatforms ?? [],
        period: dto.period ?? '',
      }),
    };
  }
}
