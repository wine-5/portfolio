import type { Game, GameCategory } from '@domain/entities/Game';
import type { GameCollection } from '@application/usecases/GetGameCollection';
import { View } from '../components/View';
import { GameDetailModal } from '../components/GameDetailModal';
import { esc, asset, storeChip, linkIcon } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/games.css';

type Filter = GameCategory | 'all';

/** 言語ドロップダウンから除外する非言語の技術(エンジン・シェーダー等) */
const NON_LANGUAGES: ReadonlySet<string> = new Set([
  'Unity',
  'Sharder',
  'Shader',
  'Siv3D',
  'DxLib',
]);

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
  private tech = 'all';

  constructor() {
    super('section', 'games');
    this.el.id = 'games';
  }

  override render(collection: GameCollection): void {
    this.collection = collection;
    this.games = [...collection.featured, ...collection.entries];
    this.redraw();
  }

  /**
   * 図鑑外(ヒーローのカルーセル等)から指定 No. のカードへスクロールし、
   * 一瞬シャイン演出で光らせてタップ先を知らせる
   */
  focusEntry(entryNo: number): void {
    const game = this.games.find((g) => g.entryNo === entryNo);
    if (!game) return;

    // 絞り込みで対象カードが非表示なら ALL に戻して描画し直す
    const visible =
      (this.filter === 'all' || game.category === this.filter) &&
      (this.tech === 'all' || game.technologies.includes(this.tech));
    if (!visible) {
      this.filter = 'all';
      this.tech = 'all';
      this.redraw();
    }

    const node = this.el.querySelector<HTMLElement>(`[data-entry="${entryNo}"]`);
    if (!node) return;

    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // スクロールが落ち着いた頃にシャインを発火(再タップでも再生されるよう一度リセット)
    window.setTimeout(() => {
      node.classList.remove('entry-flash');
      void node.offsetWidth;
      node.classList.add('entry-flash');
      window.setTimeout(() => node.classList.remove('entry-flash'), 1100);
    }, 450);
  }

  private redraw(): void {
    const match = (g: Game): boolean =>
      (this.filter === 'all' || g.category === this.filter) &&
      (this.tech === 'all' || g.technologies.includes(this.tech));
    const featured = this.collection.featured.filter(match);
    const entries = this.collection.entries.filter(match);
    const techs = [...new Set(this.games.flatMap((g) => [...g.technologies]))]
      .filter((t) => !NON_LANGUAGES.has(t))
      .sort();

    this.el.innerHTML = `
      <header class="games__header">
        <p class="games__kicker">// DATABASE</p>
        <h2 class="games__title">${esc(t('gamesTitle'))}</h2>
        <p class="games__count">${esc(t('registered'))}: ${String(this.games.length).padStart(3, '0')}</p>
      </header>
      <nav class="games__filters" aria-label="${esc(t('categoryFilter'))}">
        ${FILTERS.map(
          (f) => `
            <button class="filter-btn${this.filter === f.id ? ' filter-btn--active' : ''}" data-filter="${f.id}">
              ${f.label}
            </button>`,
        ).join('')}
        <select class="tech-select" data-tech aria-label="${esc(t('languageFilter'))}">
          <option value="all">ALL LANGUAGES</option>
          ${techs
            .map(
              (t) =>
                `<option value="${esc(t)}"${this.tech === t ? ' selected' : ''}>${esc(t)}</option>`,
            )
            .join('')}
        </select>
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

    this.el.querySelector<HTMLSelectElement>('[data-tech]')?.addEventListener('change', (e) => {
      this.tech = (e.target as HTMLSelectElement).value;
      this.redraw();
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

/** どのストアで遊べる/遊べる予定なのかがひと目で分かるリボン文言 */
function featuredLabel(game: Game): string {
  const store = game.release.kind !== 'archived' ? game.release.store : undefined;
  const storeName = store === 'app-store' ? 'APP STORE' : store === 'steam' ? 'STEAM' : '';
  if (game.release.kind === 'playable') {
    return storeName ? `${storeName} RELEASED` : 'RELEASED';
  }
  return storeName ? `${storeName} COMING SOON` : 'FEATURED';
}

function featuredCard(game: Game): string {
  const released = game.release.kind === 'playable';
  const chip = game.release.kind !== 'archived' && game.release.store ? storeChip(game.release.store) : '';
  const action =
    game.release.kind === 'playable'
      ? `<a class="btn btn--primary btn--lg" href="${esc(game.release.url)}" target="_blank" rel="noopener">${linkIcon(game.release.url)}PLAY NOW</a>${chip}<span class="btn">${esc(t('details'))}</span>`
      : `<span class="badge badge--soon">COMING SOON</span>${chip}${
          game.release.kind === 'coming-soon' && game.release.url
            ? `<a class="btn btn--lg" href="${esc(game.release.url)}" target="_blank" rel="noopener">${linkIcon(game.release.url)}${esc(t('steamPage'))}</a>`
            : ''
        }<span class="btn">${esc(t('details'))}</span>`;

  return `
    <article class="featured-card${released ? ' featured-card--released' : ''}" data-entry="${game.entryNo}" tabindex="0">
      <div class="featured-card__label">${featuredLabel(game)}</div>
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
      ${game.award ? `<span class="entry-card__award" title="${esc(game.award)}">🏆 ${esc(game.award)}</span>` : ''}
      <span class="entry-card__no">No.${String(game.entryNo).padStart(3, '0')}</span>
      <div class="entry-card__visual">
        <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
      </div>
      <span class="name-label">NAME</span>
      <h3 class="entry-card__title">${esc(game.title)}</h3>
      <p class="entry-card__tech">${game.technologies.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      <span class="entry-card__detail">▸ ${esc(t('viewDetails'))}</span>
    </li>`;
}
