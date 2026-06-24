import { Component } from '../core/Component';
import { TitleScreen, TITLE_SCREEN_STYLES } from './TitleScreen';
import { DotBox, DOT_BOX_STYLES } from './DotBox';
import { EXP_BAR_STYLES } from './ExpBar';
import { HUDNav, HUD_NAV_STYLES } from './HUDNav';

/**
 * ルートアプリケーションコンポーネント。
 */
export class App extends Component {
  private titleScreen: TitleScreen | null = null;
  private showMainContent = false;

  render(): HTMLElement {
    const root = document.createElement('div');
    root.id = 'app-root';

    // CSS をインジェクト
    this.injectGlobalStyles();

    // タイトル画面を表示
    this.titleScreen = new TitleScreen();
    this.titleScreen.setOnComplete(() => {
      this.onTitleScreenComplete();
    });

    const titleContainer = document.createElement('div');
    titleContainer.id = 'title-container';
    root.appendChild(titleContainer);

    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    mainContainer.style.display = 'none';
    root.appendChild(mainContainer);

    // mount後にタイトル画面をマウント
    return root;
  }

  protected onMounted(): void {
    const titleContainer = document.getElementById('title-container');
    if (titleContainer && this.titleScreen) {
      this.titleScreen.mount(titleContainer);
    }
  }

  private onTitleScreenComplete(): void {
    const titleContainer = document.getElementById('title-container');
    const mainContainer = document.getElementById('main-container');

    if (titleContainer) {
      titleContainer.style.display = 'none';
    }
    if (mainContainer) {
      mainContainer.style.display = 'block';
      this.renderMainContent(mainContainer);
    }
  }

  private renderMainContent(container: HTMLElement): void {
    // HUDNavを追加
    const hudNav = new HUDNav();
    const navEl = hudNav.render();
    container.appendChild(navEl);

    // Main contentエリア
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'main-content';
    container.appendChild(mainContent);

    // TODO: セクション群をここに追加
    // - GamesSection
    // - AboutSection
    // - SkillsSection
    // - ContactSection
  }

  private injectGlobalStyles(): void {
    if (!document.getElementById('wine5-styles')) {
      const style = document.createElement('style');
      style.id = 'wine5-styles';
      style.textContent = [TITLE_SCREEN_STYLES, DOT_BOX_STYLES, EXP_BAR_STYLES, HUD_NAV_STYLES].join('\n\n');
      document.head.appendChild(style);
    }
  }
}
