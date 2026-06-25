import type { ExperienceLevel } from '../value-objects/ExperienceLevel';
import { calculateExperienceLevel } from '../value-objects/ExperienceLevel';

/**
 * スキルエンティティ。
 * 習得月数と経験レベルの関連を管理。
 */
export class Skill {
  readonly id: string;
  readonly title: string;
  readonly proficiency: string; // JSONから読む場合の標準値
  readonly additionalSkills: readonly string[];
  readonly projects: string;

  private _experienceMonths: number = 0;
  private _cachedLevel: ExperienceLevel | null = null;

  constructor(
    id: string,
    title: string,
    proficiency: string,
    additionalSkills: string[],
    projects: string
  ) {
    this.id = id;
    this.title = title;
    this.proficiency = proficiency;
    this.additionalSkills = Object.freeze([...additionalSkills]);
    this.projects = projects;
  }

  setExperienceMonths(months: number): void {
    this._experienceMonths = Math.max(0, months);
    this._cachedLevel = null; // キャッシュクリア
  }

  getExperienceLevel(): ExperienceLevel {
    if (!this._cachedLevel) {
      this._cachedLevel = calculateExperienceLevel(this._experienceMonths);
    }
    return this._cachedLevel;
  }
}
