import type { Internship } from '@domain/entities/Internship';
import type { InternshipRepository } from '../ports/InternshipRepository';
import type { Locale } from '../ports/Locale';

/** Internship セクション表示用 */
export class GetInternships {
  constructor(private readonly internships: InternshipRepository) {}

  execute(locale: Locale): Promise<readonly Internship[]> {
    return this.internships.findAll(locale);
  }
}
