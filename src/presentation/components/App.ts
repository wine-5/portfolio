import { Component } from '../core/Component';
import { TitleScreen, TITLE_SCREEN_STYLES } from './TitleScreen';
import { DOT_BOX_STYLES } from './DotBox';
import { EXP_BAR_STYLES } from './ExpBar';
import { DS3HomeScreen, DS3_HOME_SCREEN_STYLES } from './DS3HomeScreen';

/**
 * ルートアプリケーションコンポーネント。
 */
export class App extends Component {
  private titleScreen: TitleScreen | null = null;

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

  override onMounted(): void {
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
      this.renderMainContent(mainContainer).catch(console.error);
    }
  }

  private async renderMainContent(container: HTMLElement): Promise<void> {
    // 3DSホーム画面（アプリ本体シェル）
    const ds3 = new DS3HomeScreen();
    await ds3.initialize();
    ds3.mount(container);
  }

  private injectGlobalStyles(): void {
    if (!document.getElementById('wine5-styles')) {
      const style = document.createElement('style');
      style.id = 'wine5-styles';
      style.textContent = [
        TITLE_SCREEN_STYLES,
        DOT_BOX_STYLES,
        EXP_BAR_STYLES,
        DS3_HOME_SCREEN_STYLES,
      ].join('\n\n');
      document.head.appendChild(style);
    }
  }
}
