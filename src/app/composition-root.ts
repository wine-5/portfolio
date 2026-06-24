import { CodexCatalog, ProjectGameStatService } from '@domain/index';
import {
  GetCodexEntries,
  GetGameDetail,
  GetSkillSheet,
  GetProfile,
  GetUpdateLog,
  SubmitContactLetter,
} from '@application/index';
import {
  JsonProjectRepository,
  JsonSkillRepository,
  JsonProfileRepository,
  JsonUpdateLogRepository,
  EmailJsContactGateway,
  I18nProviderImpl,
  LocalStoragePreferenceStore,
} from '@infrastructure/index';
import { EventBus } from '@presentation/core/EventBus';

/**
 * Composition Root: すべての依存を配線し、インスタンスを生成。
 */
export class CompositionRoot {
  // Domain Services
  private codexCatalog = new CodexCatalog();
  private projectGameStatService = new ProjectGameStatService();

  // Infrastructure (Repositories & Gateways)
  private projectRepo = new JsonProjectRepository();
  private skillRepo = new JsonSkillRepository();
  private profileRepo = new JsonProfileRepository();
  private updateRepo = new JsonUpdateLogRepository();
  private contactGateway = new EmailJsContactGateway();
  private i18nProvider = new I18nProviderImpl();
  private preferenceStore = new LocalStoragePreferenceStore();

  // Application Use Cases
  getCodexEntries = new GetCodexEntries(this.projectRepo, this.codexCatalog);
  getGameDetail = new GetGameDetail(this.projectRepo, this.projectGameStatService, this.codexCatalog);
  getSkillSheet = new GetSkillSheet(this.skillRepo);
  getProfile = new GetProfile(this.profileRepo);
  getUpdateLog = new GetUpdateLog(this.updateRepo);
  submitContactLetter = new SubmitContactLetter(this.contactGateway);

  // Event Bus
  eventBus = new EventBus();

  // Getters
  getI18nProvider() {
    return this.i18nProvider;
  }

  getPreferenceStore() {
    return this.preferenceStore;
  }

  getEventBus() {
    return this.eventBus;
  }
}

// グローバルシングルトン
export const root = new CompositionRoot();
