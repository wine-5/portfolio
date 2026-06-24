import type { CodexEntryVM } from '@application/index';
import { root } from '@app/composition-root';

/**
 * ゲーム図鑑: モンスター図鑑風の作品一覧。
 */
export class GameCodex {
  constructor(private entries: CodexEntryVM[]) {}

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'game-codex';

    const title = document.createElement('h3');
    title.className = 'codex__title';
    title.textContent = `▸ GAME CODEX (${this.entries.length})`;
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'codex__grid';

    this.entries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'codex-card';
      card.style.cursor = 'pointer';

      const no = document.createElement('div');
      no.className = 'codex-card__no';
      no.textContent = entry.codexNo;

      const thumb = document.createElement('img');
      thumb.src = entry.thumbnailUrl;
      thumb.alt = entry.title;
      thumb.className = 'codex-card__thumb';

      const title = document.createElement('div');
      title.className = 'codex-card__title';
      title.textContent = entry.title;

      const category = document.createElement('div');
      category.className = 'codex-card__category';
      category.textContent = entry.category;

      card.appendChild(no);
      card.appendChild(thumb);
      card.appendChild(title);
      card.appendChild(category);

      // クリック時の詳細表示
      card.addEventListener('click', async () => {
        const detail = await root.getGameDetail.execute(entry.id, 'ja');
        if (detail) {
          console.log('Game Detail:', detail);
          // TODO: GameStatusModal を表示
        }
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
    return container;
  }
}

/**
 * GameCodex CSS。
 */
export const GAME_CODEX_STYLES = `
.game-codex {
  margin-bottom: var(--space-12);
}

.codex__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--ink);
  margin-bottom: var(--space-4);
  border-bottom: 2px dotted var(--line-soft);
  padding-bottom: var(--space-2);
}

.codex__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}

.codex-card {
  border: 2px solid var(--line);
  background: var(--bg-window);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 150ms;
  box-shadow: var(--window-shadow);
}

.codex-card:hover {
  transform: scale(1.05);
  border-color: var(--select);
  box-shadow: 0 0 8px var(--accent);
}

.codex-card__no {
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  color: var(--c-gold);
  margin-bottom: var(--space-1);
}

.codex-card__thumb {
  width: 100%;
  height: 100px;
  object-fit: cover;
  image-rendering: pixelated;
  border: 1px solid var(--line-soft);
  margin-bottom: var(--space-2);
}

.codex-card__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  color: var(--ink);
  margin-bottom: var(--space-1);
  word-break: break-word;
  line-height: 1.2;
}

.codex-card__category {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--ink-dim);
}

@media (max-width: 640px) {
  .codex__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-2);
  }

  .codex-card {
    padding: var(--space-1);
  }

  .codex-card__thumb {
    height: 80px;
  }
}
`;
