import '@presentation/styles/tokens.css';
import '@presentation/styles/base.css';
import { root } from '@app/composition-root';
import { App } from '@presentation/components/App';

/**
 * アプリケーション起動ポイント。
 */
async function bootstrap() {
  try {
    const i18n = root.getI18nProvider();
    const prefs = root.getPreferenceStore();

    // テーマと言語を復元
    const theme = await prefs.getTheme();
    const lang = await prefs.getLanguage();

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = lang;

    // i18n をロード
    await i18n.loadLanguage(lang);
    i18n.setCurrentLanguage(lang);

    // Root App Component をマウント
    const app = new App();
    const appRoot = document.getElementById('app');
    if (appRoot) {
      app.mount(appRoot);
    }

    console.log('🎮 wine-5 Portfolio ready!');
  } catch (error) {
    console.error('Bootstrap failed:', error);
  }
}

bootstrap();
