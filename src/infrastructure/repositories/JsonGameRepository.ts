import type { Game, GameCategory, ReleaseState } from '@domain/entities/Game';
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
  carouselImage?: string;
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
 * TofuRunner = App Store 公開済み(PLAY NOW)、蝶々反乱 = Steam 公開予定(COMING SOON)。
 * タイトルはロケールごとに翻訳されるため、言語に依存しない githubUrl をキーにする
 */
const FEATURED_RELEASE: Record<string, ReleaseState> = {
  'https://github.com/Allow-hub/TouhuRunner': {
    kind: 'playable',
    url: 'https://apps.apple.com/jp/app/tofurunner/id6755136719',
    store: 'app-store',
  },
  // 2026-07-14 19:00 に Steam 公開予定(公開までは COMING SOON + ストアページ誘導)
  'https://github.com/wine-5/SGC2025': {
    kind: 'coming-soon',
    store: 'steam',
    url: 'https://store.steampowered.com/app/4841000/_/',
  },
};

export class JsonGameRepository implements GameRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(locale: Locale): Promise<readonly Game[]> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/projects.json`);
    if (!res.ok) {
      throw new Error(`projects.json の取得に失敗しました (${res.status})`);
    }
    const dtos = (await res.json()) as ProjectDto[];
    // JSON は新しい順なので、最初に作った作品(末尾)が No.001 になるよう逆順で採番する
    return dtos.map((dto, i) => this.toGame(dto, dtos.length - i));
  }

  private toGame(dto: ProjectDto, entryNo: number): Game {
    const featuredRelease = dto.githubUrl ? FEATURED_RELEASE[dto.githubUrl] : undefined;
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
      ...(dto.carouselImage !== undefined ? { carouselImage: dto.carouselImage } : {}),
      ...(dto.award !== undefined ? { award: dto.award } : {}),
      year: dto.year ?? '',
      category: (dto.category ?? 'game') as GameCategory,
      teamSize: dto.teamSize ?? '',
      period: dto.period ?? '',
      release,
      featured: featuredRelease !== undefined,
    };
  }
}
