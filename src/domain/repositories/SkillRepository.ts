import { Skill } from '../entities/Skill';

/**
 * ポート: スキルリポジトリ。
 */
export interface SkillRepository {
  getAll(lang: string): Promise<Skill[]>;
  getById(id: string, lang: string): Promise<Skill | null>;
}
