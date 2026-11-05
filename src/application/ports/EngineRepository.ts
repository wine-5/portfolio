import type { Engine } from '@domain/entities/Engine';
import type { Locale } from './Locale';

/** エンジン紹介データの取得口。実装は infrastructure 層 */
export interface EngineRepository {
  find(locale: Locale): Promise<Engine>;
}
