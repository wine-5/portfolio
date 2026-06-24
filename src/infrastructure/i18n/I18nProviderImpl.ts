import { I18nProvider } from '@application/ports/I18nProvider';

/**
 * 実装: 国際化プロバイダー。
 * JSON ファイルから各言語のメッセージを読み込む。
 */
export class I18nProviderImpl implements I18nProvider {
  private cache: Map<string, Map<string, any>> = new Map();
  private currentLang = 'ja';

  setCurrentLanguage(lang: string): void {
    this.currentLang = lang;
  }

  async loadLanguage(lang: string): Promise<void> {
    if (this.cache.has(lang)) return;

    try {
      const files = ['common', 'sections'];
      const messages = new Map<string, any>();

      for (const file of files) {
        const url = `/portfolio/data/locales/${lang}/${file}.json`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          this.flattenJson(data, '', messages, file);
        }
      }

      this.cache.set(lang, messages);
    } catch (e) {
      console.error('I18nProviderImpl.loadLanguage:', e);
    }
  }

  getMessage(key: string, lang: string): string {
    const msgs = this.cache.get(lang);
    if (!msgs) return key;
    return msgs.get(key) ?? key;
  }

  getMessageNow(key: string): string {
    return this.getMessage(key, this.currentLang);
  }

  private flattenJson(obj: any, prefix: string, target: Map<string, any>, namespace: string): void {
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${namespace}.${prefix}.${k}` : `${namespace}.${k}`;

      if (typeof v === 'object' && v !== null) {
        this.flattenJson(v, k, target, namespace);
      } else {
        target.set(fullKey, v);
      }
    }
  }
}
