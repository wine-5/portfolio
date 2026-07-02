import type { Profile } from '@domain/entities/Profile';
import type { Locale } from './Locale';

/** プロフィールデータの取得口。実装は infrastructure 層 */
export interface ProfileRepository {
  get(locale: Locale): Promise<Profile>;
}
