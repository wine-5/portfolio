/**
 * ポート: 国際化プロバイダー。
 */
export interface I18nProvider {
  /**
   * キーからメッセージを取得。ドット記法対応。
   * 例: "common.header.home" → "Home"
   */
  getMessage(key: string, lang: string): string;

  /**
   * 現在の言語で取得。
   */
  getMessageNow(key: string): string;
}
