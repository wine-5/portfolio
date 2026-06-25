/**
 * 技術スタック(値オブジェクト)。
 * JSONから読み込まれた技術配列を表現。
 */
export class TechStack {
  readonly technologies: readonly string[];

  constructor(techs: string[]) {
    this.technologies = Object.freeze([...techs]);
  }

  has(tech: string): boolean {
    return this.technologies.includes(tech);
  }

  [Symbol.iterator]() {
    return this.technologies[Symbol.iterator]();
  }

  toJSON(): string[] {
    return [...this.technologies];
  }
}
