import type { Game } from '@domain/entities/Game';
import type { GameRepository } from '../ports/GameRepository';
import type { Locale } from '../ports/Locale';

export interface GameCollection {
  readonly featured: readonly Game[];
  readonly entries: readonly Game[];
}

/** 図鑑表示用に FEATURED と通常エントリを分けて返す */
export class GetGameCollection {
  constructor(private readonly games: GameRepository) {}

  async execute(locale: Locale): Promise<GameCollection> {
    const all = await this.games.findAll(locale);
    return {
      featured: all.filter((g) => g.featured),
      entries: all.filter((g) => !g.featured),
    };
  }
}
