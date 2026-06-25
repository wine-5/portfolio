/**
 * ビューモデル: 図鑑エントリ。
 * Gamesセクション・図鑑表示用。
 */
export interface CodexEntryVM {
  codexNo: string;           // "No.001"
  id: string;
  title: string;
  category: string;          // "ゲーム", "Webゲーム", "Webツール"
  thumbnailUrl: string;
  description: string;
  featured: boolean;
  featuredBadge?: string;    // "PLAY NOW" / "COMING SOON"
  installUrl?: string;       // featured かつ AppStore 公開済みの場合
}
