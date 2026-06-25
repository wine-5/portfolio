import { root } from '@app/composition-root';

/**
 * 言語切替ボタン: 日本語(ja) / 英語(en) を切り替え。
 */
export class LanguageToggle {
  private currentLang: 'ja' | 'en' = 'ja';

  async initialize(): Promise<void> {
    this.currentLang = await root.getPreferenceStore().getLanguage();
  }

  render(): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'language-toggle';
    btn.title = '言語を切り替え (JP/EN)';
    btn.textContent = this.currentLang === 'ja' ? '🇯🇵' : '🇺🇸';

    btn.addEventListener('click', async () => {
      const newLang = this.currentLang === 'ja' ? 'en' : 'ja';
      await root.getPreferenceStore().setLanguage(newLang);
      this.currentLang = newLang;
      btn.textContent = newLang === 'ja' ? '🇯🇵' : '🇺🇸';

      // i18n を再ロード（本実装ではページリロードが必要）
      await root.getI18nProvider().loadLanguage(newLang);
      root.getI18nProvider().setCurrentLanguage(newLang);
    });

    return btn;
  }
}

/**
 * LanguageToggle CSS。
 */
export const LANGUAGE_TOGGLE_STYLES = `
.language-toggle {
  background: none;
  border: none;
  color: var(--ink);
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--space-1);
  transition: transform 150ms;
}

.language-toggle:hover {
  transform: scale(1.2);
}

.language-toggle:focus-visible {
  outline: 1px solid var(--accent);
  border-radius: 2px;
}
`;
