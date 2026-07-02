import type { Profile } from '@domain/entities/Profile';
import type { ProfileRepository } from '../ports/ProfileRepository';
import type { Locale } from '../ports/Locale';

/** About セクション(プレイヤーステータス風)表示用 */
export class GetPlayerProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  execute(locale: Locale): Promise<Profile> {
    return this.profiles.get(locale);
  }
}
