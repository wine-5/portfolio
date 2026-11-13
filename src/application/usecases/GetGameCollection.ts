import type { Game } from '@domain/entities/Game';
import type { GameRepository } from '../ports/GameRepository';
import type { Locale } from '../ports/Locale';

export interface GameCollection {
  /** 看板作品(最上部で別格表示するため featured/entries には含めない) */
  readonly flagship?: Game;
  /** リリース作品の中で大きく推す人気作(featured には含めない) */
  readonly spotlight?: Game;
  /** 人気作の次に、同じ大きなカードで出すリリース作品(PV 付き) */
  readonly showcase: readonly Game[];
  readonly featured: readonly Game[];
  readonly entries: readonly Game[];
}

/** 表示用に FLAGSHIP / FEATURED / 通常エントリを分けて返す */
export class GetGameCollection {
  constructor(private readonly games: GameRepository) {}

  async execute(locale: Locale): Promise<GameCollection> {
    const all = await this.games.findAll(locale);
    // 最新作がすぐ目に入るよう No. 降順(=制作の新しい順)で並べる
    const byNoDesc = (a: Game, b: Game): number => b.entryNo - a.entryNo;
    // 看板作品は 1 つだけ。複数立っていても最新のものを採用する
    const flagship = all.filter((g) => g.flagship).sort(byNoDesc)[0];
    // 人気作もリリース作品から 1 つだけ選ぶ(複数立っていても最新のもの)
    const spotlight = all.filter((g) => g !== flagship && g.featured && g.spotlight).sort(byNoDesc)[0];
    const showcase = all.filter((g) => g !== flagship && g !== spotlight && g.featured && g.showcase).sort(byNoDesc);
    const rest = all.filter((g) => g !== flagship && g !== spotlight && !showcase.includes(g));
    return {
      ...(flagship !== undefined ? { flagship } : {}),
      ...(spotlight !== undefined ? { spotlight } : {}),
      showcase,
      // ストア掲載の作品(公開済みと COMING SOON)は小さく派手なカードで並べ、それ以外は小グリッドへ
      featured: rest.filter((g) => g.featured).sort(byNoDesc),
      entries: rest.filter((g) => !g.featured).sort(byNoDesc),
    };
  }
}
