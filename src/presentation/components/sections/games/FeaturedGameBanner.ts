import type { CodexEntryVM } from '@application/index';

/**
 * 看板作品バナー: AppStore公開済み / Store公開予定を大きく表示。
 */
export class FeaturedGameBanner {
  constructor(private featured: CodexEntryVM[]) {}

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'featured-banner';

    if (this.featured.length === 0) {
      return container;
    }

    this.featured.forEach((game) => {
      const card = document.createElement('div');
      card.className = 'featured-card';

      const thumbnail = document.createElement('img');
      thumbnail.src = game.thumbnailUrl;
      thumbnail.alt = game.title;
      thumbnail.className = 'featured-card__image';

      const content = document.createElement('div');
      content.className = 'featured-card__content';

      const title = document.createElement('h3');
      title.textContent = game.title;
      title.className = 'featured-card__title';

      const badge = document.createElement('span');
      badge.className = 'featured-card__badge';
      badge.textContent = game.featuredBadge || '';

      const desc = document.createElement('p');
      desc.className = 'featured-card__desc';
      desc.textContent = game.description;

      content.appendChild(title);
      content.appendChild(badge);
      content.appendChild(desc);

      if (game.installUrl) {
        const link = document.createElement('a');
        link.href = game.installUrl;
        link.target = '_blank';
        link.className = 'featured-card__link btn';
        link.textContent = game.featuredBadge || 'OPEN';
        content.appendChild(link);
      }

      card.appendChild(thumbnail);
      card.appendChild(content);
      container.appendChild(card);
    });

    return container;
  }
}

/**
 * FeaturedGameBanner CSS。
 */
export const FEATURED_BANNER_STYLES = `
.featured-banner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.featured-card {
  display: flex;
  flex-direction: column;
  border: 3px solid var(--line);
  background: var(--bg-window);
  overflow: hidden;
  box-shadow: var(--window-shadow);
  transition: transform 150ms;
}

.featured-card:hover {
  transform: scale(1.02);
}

.featured-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  image-rendering: pixelated;
  border-bottom: 2px solid var(--line);
}

.featured-card__content {
  padding: var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.featured-card__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--accent);
  margin: 0 0 var(--space-2) 0;
}

.featured-card__badge {
  display: inline-block;
  background: var(--c-legendary);
  color: var(--bg-primary);
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  margin-bottom: var(--space-2);
  width: fit-content;
  border: 1px solid var(--line);
}

.featured-card__desc {
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  margin: 0 0 var(--space-3) 0;
  flex: 1;
}

.featured-card__link {
  align-self: flex-start;
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--accent);
  background: var(--bg-1);
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 150ms;
}

.featured-card__link:hover {
  background: var(--accent);
  color: var(--bg-primary);
}
`;
