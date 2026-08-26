import type { Internship } from '@domain/entities/Internship';
import type { Locale } from './Locale';

/** インターン経験データの取得口。実装は infrastructure 層 */
export interface InternshipRepository {
  findAll(locale: Locale): Promise<readonly Internship[]>;
}
