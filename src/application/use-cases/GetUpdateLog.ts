import { UpdateLogRepository } from '@domain/repositories/UpdateLogRepository';
import { UpdateLogVM } from '../view-models/UpdateLogVM';

/**
 * ユースケース: 更新履歴一覧を取得。
 */
export class GetUpdateLog {
  constructor(private updateRepo: UpdateLogRepository) {}

  async execute(lang: string): Promise<UpdateLogVM[]> {
    const logs = await this.updateRepo.getAll(lang);
    return logs.map((log) => ({
      dateStr: log.getDateString(lang as 'ja' | 'en'),
      title: log.title,
      description: log.description,
    }));
  }
}
