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
    return 'ゲーム業界へ入ることを目標にしているプログラマーです！主にUnityやDxLibを使った開発を行っており、アーキテクチャやクラス設計を意識しながらできるだけ仕様変更や追加機能が来た際にも柔軟かつ簡単にできるように意識して開発を行っています！\nプログラミングを誰よりも楽しく学び続けられるのは自分の最大の強みです！';
  }
}
