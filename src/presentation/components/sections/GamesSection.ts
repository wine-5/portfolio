import { Component } from '../../core/Component';
import { root } from '@app/composition-root';
import { FeaturedGameBanner } from './games/FeaturedGameBanner';
import { GameCodex } from './games/GameCodex';

/**
 * Games セクション: 主役。図鑑風の作品一覧。
 */
export class GamesSection extends Component {
  private featured: FeaturedGameBanner | null = null;
  private codex: GameCodex | null = null;

  async initialize(): Promise<void> {
    // データをロード
    const entries = await root.getCodexEntries.execute('ja');

    this.featured = new FeaturedGameBanner(entries.filter(e => e.featured));
    this.codex = new GameCodex(entries);
  }

  render(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'games';
    section.className = 'games-section section';

    // タイトル
    const title = document.createElement('h2');
    title.className = 'section__title games-section__title';
    title.textContent = '🎮 GAMES CODEX 🎮';
    section.appendChild(title);

    // 看板作品
    if (this.featured) {
      const featuredEl = this.featured.render();
      section.appendChild(featuredEl);
    }

    // 図鑑
    if (this.codex) {
      const codexEl = this.codex.render();
      section.appendChild(codexEl);
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
  color: var(--ink);
  margin-bottom: var(--space-6);
}
`;
