import { Project } from '../entities/Project';

/**
 * ポート: プロジェクトリポジトリ。
 * 実装は Infrastructure 層で行う。
 */
export interface ProjectRepository {
  /**
   * 指定言語のプロジェクト一覧を読み込む。
   */
  getAll(lang: string): Promise<Project[]>;

  /**
   * IDでプロジェクトを検索。
   */
  getById(id: string, lang: string): Promise<Project | null>;
}
