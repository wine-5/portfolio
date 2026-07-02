import type { Skill } from '@domain/entities/Skill';
import type { Locale } from './Locale';

/** Skills データの取得口。実装は infrastructure 層 */
export interface SkillRepository {
  findAll(locale: Locale): Promise<readonly Skill[]>;
}
