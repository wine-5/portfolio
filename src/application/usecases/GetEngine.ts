import type { Engine } from '@domain/entities/Engine';
import type { EngineRepository } from '../ports/EngineRepository';
import type { Locale } from '../ports/Locale';

/** Engine セクション表示用 */
export class GetEngine {
  constructor(private readonly engine: EngineRepository) {}

  execute(locale: Locale): Promise<Engine> {
    return this.engine.find(locale);
  }
}
