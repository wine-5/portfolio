import type { Game } from '@domain/entities/Game';
import type { Locale } from './Locale';

/** Games データの取得口。実装は infrastructure 層 */
export interface GameRepository {
  findAll(locale: Locale): Promise<readonly Game[]>;
}
