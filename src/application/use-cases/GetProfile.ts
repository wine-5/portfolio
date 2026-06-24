import { ProfileRepository } from '@domain/repositories/ProfileRepository';
import { ProfileVM } from '../view-models/ProfileVM';

/**
 * ユースケース: プロフィールを取得。
 */
export class GetProfile {
  constructor(private profileRepo: ProfileRepository) {}

  async execute(lang: string): Promise<ProfileVM> {
    const profile = await this.profileRepo.getProfile(lang);

    // RPG的なステータス表示用ダミー値
    const socialLinks = Object.entries(profile.socialLinks)
      .map(([name, url]) => ({
        name,
        label: this.getSocialLabel(name),
        url,
        icon: this.getSocialIcon(name),
      }));

    return {
      name: profile.name,
      title: profile.title,
      description: profile.description,
      imageUrl: profile.imageUrl,
      socialLinks,
      level: 5, // ダミー
      hp: 100,
      maxHp: 100,
      mp: 80,
      maxMp: 100,
    };
  }

  private getSocialLabel(name: string): string {
    const labels: Record<string, string> = {
      github: 'GitHub',
      twitter: 'X (Twitter)',
      unityroom: 'UnityRoom',
    };
    return labels[name] ?? name;
  }

  private getSocialIcon(name: string): string {
    const icons: Record<string, string> = {
      github: '🐙',
      twitter: '𝕏',
      unityroom: '🎮',
    };
    return icons[name] ?? '🔗';
  }
}
