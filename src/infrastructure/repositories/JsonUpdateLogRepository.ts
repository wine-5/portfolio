import { UpdateLogRepository } from '@domain/repositories/UpdateLogRepository';
import { UpdateLog } from '@domain/entities/UpdateLog';

/**
 * 実装: JSON ベースの更新ログリポジトリ。
 */
export class JsonUpdateLogRepository implements UpdateLogRepository {
  async getAll(lang: string): Promise<UpdateLog[]> {
    const data = await this.fetchJson(`/portfolio/data/locales/${lang}/updates.json`);
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => new UpdateLog(item.date, item.title, item.description));
  }

  private async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return response.json();
    } catch (e) {
      console.error('JsonUpdateLogRepository:', e);
      return [];
    }
  }
}
