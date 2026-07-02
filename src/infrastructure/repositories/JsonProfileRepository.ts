import type { Profile } from '@domain/entities/Profile';
import type { ProfileRepository } from '@application/ports/ProfileRepository';
import type { Locale } from '@application/ports/Locale';

export class JsonProfileRepository implements ProfileRepository {
  constructor(private readonly baseUrl: string) {}

  async get(locale: Locale): Promise<Profile> {
    const res = await fetch(`${this.baseUrl}data/locales/${locale}/profile.json`);
    if (!res.ok) {
      throw new Error(`profile.json の取得に失敗しました (${res.status})`);
    }
    return (await res.json()) as Profile;
  }
}
