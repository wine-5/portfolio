/**
 * ポート: 設定永続化(テーマ・言語)。
 */
export type Theme = 'day' | 'night';
export type Language = 'ja' | 'en';

export interface PreferenceStore {
  getTheme(): Promise<Theme>;
  setTheme(theme: Theme): Promise<void>;

  getLanguage(): Promise<Language>;
  setLanguage(lang: Language): Promise<void>;
}
