import { UpdateLog } from '../entities/UpdateLog';

/**
 * ポート: 更新履歴リポジトリ。
 */
export interface UpdateLogRepository {
  getAll(lang: string): Promise<UpdateLog[]>;
}
