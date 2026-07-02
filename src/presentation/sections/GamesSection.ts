import type { Game, GameCategory } from '@domain/entities/Game';
import type { GameCollection } from '@application/usecases/GetGameCollection';
import { View } from '../components/View';
import { GameDetailModal } from '../components/GameDetailModal';
import { esc, asset, storeChip } from '../util/html';
import '../styles/games.css';

type Filter = GameCategory | 'all';

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'game', label: 'GAME' },
  { id: 'web-game', label: 'WEB GAME' },
  { id: 'web', label: 'WEB TOOL' },
];

/** モンスター図鑑風の Games セクション(近未来 HUD デザイン) */
export class GamesSection extends View<GameCollection> {
  private readonly modal = new GameDetailModal();
  private collection: GameCollection = { featured: [], entries: [] };
  private games: readonly Game[] = [];
  private filter: Filter = 'all';

  constructor() {
    super('section', 'games');
    this.el.id = 'games';
  }

  override render(collection: GameCollection): void {
    this.collection = collection;
    this.games = [...collection.featured, ...collection.entries];
    this.redraw();
  }

  private redraw(): void {
    const match = (g: Game): boolean => this.filter === 'all' || g.category === this.filter;
    const featured = this.collection.featured.filter(match);
    const entries = this.collection.entries.filter(match);

    this.el.innerHTML = `
      <header class="games__header">
        <p class="games__kicker">// DATABASE</p>
        <h2 class="games__title">GAME ARCHIVE</h2>
        <p class="games__count">REGISTERED: ${String(this.games.length).padStart(3, '0')}</p>
      </header>
      <nav class="games__filters" aria-label="カテゴリ絞り込み">
        ${FILTERS.map(
          (f) => `
            <button class="filter-btn${this.filter === f.id ? ' filter-btn--active' : ''}" data-filter="${f.id}">
              ${f.label}
            </button>`,
        ).join('')}
      </nav>
      ${featured.length > 0 ? `<div class="games__featured">${featured.map((g) => featuredCard(g)).join('')}</div>` : ''}
      ${
        entries.length > 0
          ? `<ol class="games__grid">${entries.map((g) => entryCard(g)).join('')}</ol>`
          : featured.length === 0
            ? '<p class="games__empty">NO DATA</p>'
            : ''
      }
    `;

    this.el.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset['filter'] as Filter;
        this.redraw();
      });
    });

    this.el.querySelectorAll<HTMLElement>('[data-entry]').forEach((node) => {
      node.addEventListener('click', (e) => {
        // FEATURED の PLAY NOW リンクはモーダルを開かずそのまま遷移させる
        if ((e.target as HTMLElement).closest('a')) return;
        const no = Number(node.dataset['entry']);
        const game = this.games.find((g) => g.entryNo === no);
        if (game) this.modal.open(game);
      });
    });
  }
}

function featuredCard(game: Game): string {
  const released = game.release.kind === 'playable';
  const chip = game.release.kind !== 'archived' && game.release.store ? storeChip(game.release.store) : '';
  const action =
    game.release.kind === 'playable'
      ? `<a class="btn btn--primary btn--lg" href="${esc(game.release.url)}" target="_blank" rel="noopener">PLAY NOW</a>${chip}`
      : `<span class="badge badge--soon">COMING SOON</span>${chip}`;

  return `
    <article class="featured-card${released ? ' featured-card--released' : ''}" data-entry="${game.entryNo}" tabindex="0">
      <div class="featured-card__label">${released ? 'RELEASED' : 'FEATURED'}</div>
      <div class="featured-card__visual">
        <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
      </div>
      <div class="featured-card__body">
        <span class="featured-card__no">No.${String(game.entryNo).padStart(3, '0')}</span>
        <span class="name-label">NAME</span>
        <h3 class="featured-card__title">${esc(game.title)}</h3>
        <p class="featured-card__desc">${esc(game.description)}</p>
        <div class="featured-card__action">${action}</div>
      </div>
    </article>`;
}

function entryCard(game: Game): string {
  return `
    <li class="entry-card" data-entry="${game.entryNo}" tabindex="0">
      <span class="entry-card__no">No.${String(game.entryNo).padStart(3, '0')}</span>
      <div class="entry-card__visual">
        <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
      </div>
      <span class="name-label">NAME</span>
      <h3 class="entry-card__title">${esc(game.title)}</h3>
      <p class="entry-card__tech">${game.technologies.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
    </li>`;
}
