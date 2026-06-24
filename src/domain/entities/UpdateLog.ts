/**
 * 更新履歴エンティティ。
 * Updates / Timeline のログエントリ。
 */
export class UpdateLog {
  readonly date: Date;
  readonly title: string;
  readonly description: string;

  constructor(dateStr: string, title: string, description: string) {
    this.date = new Date(dateStr);
    this.title = title;
    this.description = description;
  }

  getDateString(lang: 'ja' | 'en' = 'ja'): string {
    if (lang === 'en') {
      return this.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return this.date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
