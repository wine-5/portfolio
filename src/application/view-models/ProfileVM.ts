/**
 * ビューモデル: プロフィール(プレイヤーステータス)。
 */
export interface ProfileVM {
  name: string;
  title: string;
  description: string;
  imageUrl?: string;
  socialLinks: Array<{
    name: string;
    label: string;
    url: string;
    icon: string;
  }>;

  // RPG風ステータス表示用(ダミー値)
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}
