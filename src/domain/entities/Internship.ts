/** インターンで得た学び1件(見出し+補足) */
export interface InternshipLearning {
  readonly title: string;
  readonly body: string;
}

/** インターンシップ経験1件 */
export interface Internship {
  readonly id: string;
  readonly company: string;
  readonly period: string;
  readonly theme: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly learnings: readonly InternshipLearning[];
}
