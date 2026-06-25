import { Profile } from '../entities/Profile';

/**
 * ポート: プロフィールリポジトリ。
 */
export interface ProfileRepository {
  getProfile(lang: string): Promise<Profile>;
}
