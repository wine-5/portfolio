/** Skills セクションの 1 能力。level は proficiency(0-100%)から導出 */
export interface Skill {
  readonly id: string;
  readonly title: string;
  readonly additionalSkills: readonly string[];
  readonly projects: string;
  readonly proficiency: number; // 0-100
  readonly level: number; // 1-99
}
