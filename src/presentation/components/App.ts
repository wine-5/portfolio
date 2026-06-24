import { Component } from '../core/Component';
import { TitleScreen, TITLE_SCREEN_STYLES } from './TitleScreen';
import { DOT_BOX_STYLES } from './DotBox';
import { EXP_BAR_STYLES } from './ExpBar';
import { HUDNav, HUD_NAV_STYLES } from './HUDNav';
import { GamesSection, GAMES_SECTION_STYLES } from './sections/GamesSection';
import { FEATURED_BANNER_STYLES } from './sections/games/FeaturedGameBanner';
import { GAME_CODEX_STYLES } from './sections/games/GameCodex';
import { AboutSection, ABOUT_SECTION_STYLES } from './sections/AboutSection';
import { SkillsSection, SKILLS_SECTION_STYLES } from './sections/SkillsSection';
import { ContactSection, CONTACT_SECTION_STYLES } from './sections/ContactSection';

/**
 * Main content area styles.
 */
const MAIN_CONTENT_STYLES = `
.main-content {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-12) var(--container-pad);
}

.section {
  scroll-margin-top: var(--hud-height);
}
`;

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
    // HUDNavを追加
    const hudNav = new HUDNav();
    const navEl = await hudNav.render();
    container.appendChild(navEl);

    // Main contentエリア
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'main-content';
    container.appendChild(mainContent);

    // Games セクション
    const gamesSection = new GamesSection();
    await gamesSection.initialize();
    const gameEl = gamesSection.render();
    mainContent.appendChild(gameEl);

    // About セクション
    const aboutSection = new AboutSection();
    await aboutSection.initialize();
    const aboutEl = aboutSection.render();
    mainContent.appendChild(aboutEl);

    // Skills セクション
    const skillsSection = new SkillsSection();
    await skillsSection.initialize();
    const skillsEl = skillsSection.render();
    mainContent.appendChild(skillsEl);

    // Contact セクション
    const contactSection = new ContactSection();
    const contactEl = contactSection.render();
    mainContent.appendChild(contactEl);
  }

  private injectGlobalStyles(): void {
    if (!document.getElementById('wine5-styles')) {
      const style = document.createElement('style');
      style.id = 'wine5-styles';
      style.textContent = [
        TITLE_SCREEN_STYLES,
        DOT_BOX_STYLES,
        EXP_BAR_STYLES,
        HUD_NAV_STYLES,
        MAIN_CONTENT_STYLES,
        GAMES_SECTION_STYLES,
        FEATURED_BANNER_STYLES,
        GAME_CODEX_STYLES,
        ABOUT_SECTION_STYLES,
        SKILLS_SECTION_STYLES,
        CONTACT_SECTION_STYLES,
      ].join('\n\n');
      document.head.appendChild(style);
    }
  }
}
