import { Component } from '../../core/Component';
import { root } from '@app/composition-root';
import { FeaturedGameBanner } from './games/FeaturedGameBanner';
import { GameList } from './games/GameList';

/**
 * Games セクション: 主役。看板作品 + 制作ゲーム一覧。
 */
export class GamesSection extends Component {
  private featured: FeaturedGameBanner | null = null;
  private gameList: GameList | null = null;

  async initialize(): Promise<void> {
    // データをロード
    const entries = await root.getCodexEntries.execute('ja');

    this.featured = new FeaturedGameBanner(entries.filter(e => e.featured));
    this.gameList = new GameList(entries);
  }

  render(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'games';
    section.className = 'games-section section';

    // タイトル
    const title = document.createElement('h2');
    title.className = 'section__title games-section__title';
    title.textContent = '🎮 MY GAMES 🎮';
    section.appendChild(title);

    // 看板作品
    if (this.featured) {
      const featuredEl = this.featured.render();
      section.appendChild(featuredEl);
    }

    // ゲーム一覧
    if (this.gameList) {
      const listEl = this.gameList.render();
      section.appendChild(listEl);
    }

    return section;
  }
}

/**
 * Games Section CSS。
 */
export const GAMES_SECTION_STYLES = `
.games-section {
  background: transparent;
}

.games-section__title {
  text-align: center;
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  color: var(--accent);
  margin-bottom: var(--space-8);
  text-shadow: 2px 2px 0 var(--line);
}

.section__title {
  font-family: var(--font-pixel);
  color: var(--accent);
  margin-bottom: var(--space-6);
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  font-weight: bold;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
`;
