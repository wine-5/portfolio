import type { ProfileRepository } from '@domain/repositories/ProfileRepository';
import { Profile } from '@domain/entities/Profile';

/**
 * 実装: JSON ベースのプロフィール取得。
 * 実際には common.json から手動で構築(固定値)。
 */
export class JsonProfileRepository implements ProfileRepository {
  async getProfile(): Promise<Profile> {
    // common.json から取得するのが理想だが、
    // プロフィール情報は既存 json に明示的にはないため、
    // 固定値で返す
    const socialLinks = this.getSocialLinks();

    return new Profile(
      'wine-5',
      'Game Developer',
      this.getDescription(),
      socialLinks,
      '/portfolio/images/icons/profile-icon.png'
    );
  }

  private getSocialLinks(): Record<string, string> {
    return {
      github: 'https://github.com/wine-5',
      twitter: 'https://x.com/wine_program',
      unityroom: 'https://unityroom.com/users/wine-555',
    };
  }

  private getDescription(): string {
    return 'ゲーム業界を目指すゲーム開発者です。UnityとC#を使用したゲーム開発を行っており、SOLID原則を意識した設計を心がけています。プログラミングを誰よりも楽しく、追求し続けることは私の強みです。';
  }
}
