import { PreferenceStore, Theme, Language } from '@application/ports/PreferenceStore';

/**
 * 実装: LocalStorage を使用した設定永続化。
 */
export class LocalStoragePreferenceStore implements PreferenceStore {
  private readonly THEME_KEY = 'wine5:theme';
  private readonly LANG_KEY = 'wine5:language';

  async getTheme(): Promise<Theme> {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === 'day' || stored === 'night') return stored;

    // デフォルトは night
    return 'night';
  }

  async setTheme(theme: Theme): Promise<void> {
    localStorage.setItem(this.THEME_KEY, theme);
    // DOM に反映
    document.documentElement.setAttribute('data-theme', theme);
  }

  async getLanguage(): Promise<Language> {
    const stored = localStorage.getItem(this.LANG_KEY);
    if (stored === 'ja' || stored === 'en') return stored;

    // デフォルトは ja
    return 'ja';
  }

  async setLanguage(lang: Language): Promise<void> {
    localStorage.setItem(this.LANG_KEY, lang);
    // HTML lang 属性に反映
    document.documentElement.lang = lang;
  }
}
