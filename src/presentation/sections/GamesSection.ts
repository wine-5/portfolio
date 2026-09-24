import { teamHeadcount, type Game, type GameCategory } from '@domain/entities/Game';
import type { GameCollection } from '@application/usecases/GetGameCollection';
import { View } from '../components/View';
import { GameDetailModal } from '../components/GameDetailModal';
import { esc, asset, storeChip, linkIcon } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/games.css';

type Filter = GameCategory | 'all';
type Crew = 'all' | 'solo' | 'team';
type Status = 'all' | 'released' | 'awarded';

/** 絞り込みパネルの状態。全部 'all' が未絞り込み */
interface FilterState {
  category: Filter;
  tech: string;
  crew: Crew;
  status: Status;
  /** 学年('1' | '2' | …)。どの学年があるかは作品データから拾う */
  year: string;
}

const DEFAULT_FILTER: FilterState = { category: 'all', tech: 'all', crew: 'all', status: 'all', year: 'all' };

/**
 * LANGUAGE ドロップダウンに出すプログラミング言語(許可リスト)。
 * エンジン・ライブラリ・マークアップ(Unity, HTML, CSS 等)は含めない
 */
const LANGUAGES: readonly string[] = [
  'C',
  'C#',
  'C++',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Rust',
  'Go',
  'Lua',
];

/**
 * technologies の 1 項目からプログラミング言語を取り出す。
 * 「C++20」→ C++、「HTML / CSS / JavaScript」→ JavaScript のように表記ゆれを吸収する
 */
function languagesOf(tech: string): readonly string[] {
  return tech
    .split(/[\s/,]+/)
    .map((token) => token.replace(/^(C\+\+)\d+$/, '$1'))
    .filter((token) => LANGUAGES.includes(token));
}

function gameLanguages(g: Game): readonly string[] {
  return g.technologies.flatMap((tech) => [...languagesOf(tech)]);
}

const GRADE_NUMERALS: Readonly<Record<string, number>> = { 一: 1, 二: 2, 三: 3, 四: 4 };

/**
 * year の文字列から学年を取り出す。
 * 「1~2年次」「1st-2nd Year」「一~二年级」のように学年をまたぐ作品は両方の学年に含める
 */
function gradesOf(g: Game): readonly number[] {
  return [...g.year.matchAll(/[1-4一二三四]/g)].map((m) => GRADE_NUMERALS[m[0]] ?? Number(m[0]));
}

const ORDINALS: Readonly<Record<number, string>> = { 1: '1ST', 2: '2ND', 3: '3RD', 4: '4TH' };

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'game', label: 'GAME' },
  { id: 'web-game', label: 'WEB GAME' },
  { id: 'web', label: 'WEB TOOL' },
];

const CREWS: readonly { id: Crew; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'solo', label: 'SOLO' },
  { id: 'team', label: 'TEAM' },
];

const STATUSES: readonly { id: Status; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'released', label: 'RELEASED' },
  { id: 'awarded', label: 'AWARDED' },
];

function matches(g: Game, f: FilterState): boolean {
  if (f.category !== 'all' && g.category !== f.category) return false;
  if (f.tech !== 'all' && !gameLanguages(g).includes(f.tech)) return false;
  if (f.crew !== 'all') {
    const count = teamHeadcount(g);
    if (count === undefined) return false;
    if (f.crew === 'solo' ? count !== 1 : count === 1) return false;
  }
  if (f.status === 'released' && g.release.kind !== 'playable') return false;
  if (f.status === 'awarded' && !g.award) return false;
  if (f.year !== 'all' && !gradesOf(g).includes(Number(f.year))) return false;
  return true;
}

/** 'all' 以外に設定されている条件の数(FILTER ボタンのバッジ表示用) */
function activeCount(f: FilterState): number {
  return (Object.keys(f) as (keyof FilterState)[]).filter((k) => f[k] !== 'all').length;
}

/** モンスター図鑑風の Games セクション(近未来 HUD デザイン) */
export class GamesSection extends View<GameCollection> {
  private readonly modal = new GameDetailModal();
  /** FEATURED と図鑑グリッドの間に差し込む外部セクション(看板作品)の受け皿。
   *  redraw で innerHTML を作り直しても中身が消えないよう、この要素は使い回す */
  private readonly flagshipSlot = document.createElement('div');
  private collection: GameCollection = { featured: [], entries: [] };
  private games: readonly Game[] = [];
  private filter: FilterState = { ...DEFAULT_FILTER };
  /** 絞り込みパネルの開閉。条件が多いので普段は畳んでおく */
  private panelOpen = false;

  constructor() {
    super('section', 'games');
    this.el.id = 'games';
  }

  override render(collection: GameCollection): void {
    this.collection = collection;
    // 看板作品もこのセクション内に並ぶので、登録数・言語フィルタの母集団には含める
    this.games = [
      ...(collection.flagship ? [collection.flagship] : []),
      ...collection.featured,
      ...collection.entries,
    ];
    this.redraw();
  }

  /** リリース作品(FEATURED)の下に看板作品セクションを差し込む */
  mountFlagship(view: { mount(parent: HTMLElement): void }): void {
    view.mount(this.flagshipSlot);
  }

  /**
   * 図鑑外(ヒーローのカルーセル等)から指定 No. のカードへスクロールし、
   * 一瞬シャイン演出で光らせてタップ先を知らせる
   */
  focusEntry(entryNo: number): void {
    const game = this.games.find((g) => g.entryNo === entryNo);
    if (!game) return;

    // 絞り込みで対象カードが非表示なら条件を全解除して描画し直す
    if (!matches(game, this.filter)) {
      this.filter = { ...DEFAULT_FILTER };
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
    const match = (g: Game): boolean => matches(g, this.filter);
    const featured = this.collection.featured.filter(match);
    const entries = this.collection.entries.filter(match);
    const flagshipVisible = this.collection.flagship !== undefined && match(this.collection.flagship);
    // 実際に使っている言語だけを許可リストの順で並べる
    const used = new Set(this.games.flatMap((g) => [...gameLanguages(g)]));
    const techs = LANGUAGES.filter((l) => used.has(l));
    // 実際にある学年だけを若い順に並べる
    const years = [
      { id: 'all', label: 'ALL' },
      ...[...new Set(this.games.flatMap((g) => [...gradesOf(g)]))]
        .sort((a, b) => a - b)
        .map((n) => ({ id: String(n), label: ORDINALS[n] ?? String(n) })),
    ];
    const active = activeCount(this.filter);
    const shown = featured.length + entries.length + (flagshipVisible ? 1 : 0);

    this.el.innerHTML = `
      <header class="games__header">
        <p class="games__kicker">// DATABASE</p>
        <h2 class="games__title">${esc(t('gamesTitle'))}</h2>
        <p class="games__count">${esc(t('registered'))}: ${String(this.games.length).padStart(3, '0')}</p>
      </header>
      <div class="games__toolbar">
        <button class="filter-toggle${this.panelOpen ? ' filter-toggle--open' : ''}${active > 0 ? ' filter-toggle--active' : ''}" data-panel-toggle aria-expanded="${this.panelOpen}" aria-controls="games-filter-panel">
          <span class="filter-toggle__icon" aria-hidden="true">⚙</span>
          <span>${esc(t('filter'))}</span>
          ${active > 0 ? `<span class="filter-toggle__badge">${active}</span>` : ''}
          <span class="filter-toggle__chevron" aria-hidden="true">▾</span>
        </button>
        ${active > 0 ? `<button class="filter-reset" data-reset>✕ ${esc(t('reset'))}</button>` : ''}
        <span class="games__result">${String(shown).padStart(3, '0')} / ${String(this.games.length).padStart(3, '0')}</span>
      </div>
      <div class="games__filters${this.panelOpen ? ' games__filters--open' : ''}" id="games-filter-panel"${this.panelOpen ? '' : ' hidden'}>
        ${filterRow('CATEGORY', t('categoryFilter'), 'category', FILTERS, this.filter.category)}
        ${filterRow('CREW', 'CREW', 'crew', CREWS, this.filter.crew)}
        ${filterRow('STATUS', 'STATUS', 'status', STATUSES, this.filter.status)}
        ${filterRow('YEAR', 'YEAR', 'year', years, this.filter.year)}
        <div class="filter-row">
          <span class="filter-row__label">LANGUAGE</span>
          <select class="tech-select" data-tech aria-label="${esc(t('languageFilter'))}">
            <option value="all">ALL LANGUAGES</option>
            ${techs
              .map(
                (t) =>
                  `<option value="${esc(t)}"${this.filter.tech === t ? ' selected' : ''}>${esc(t)}</option>`,
              )
              .join('')}
          </select>
        </div>
      </div>
      ${featured.length > 0 ? `<div class="games__featured">${featured.map((g) => featuredCard(g)).join('')}</div>` : ''}
      <div data-flagship-slot></div>
      ${
        entries.length > 0
          ? `<ol class="games__grid">${entries.map((g) => entryCard(g)).join('')}</ol>`
          : featured.length === 0 && !flagshipVisible
            ? '<p class="games__empty">NO DATA</p>'
            : ''
      }
    `;

    // 使い回している受け皿(と中の看板作品)を、組み直した DOM の所定位置へ戻す。
    // 看板作品も絞り込みの対象にして、他のカードと表示条件を揃える
    this.el.querySelector('[data-flagship-slot]')?.replaceWith(this.flagshipSlot);
    this.flagshipSlot.hidden = !flagshipVisible;

    this.el.querySelector<HTMLButtonElement>('[data-panel-toggle]')?.addEventListener('click', () => {
      this.panelOpen = !this.panelOpen;
      this.redraw();
    });

    this.el.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
      this.filter = { ...DEFAULT_FILTER };
      this.redraw();
    });

    this.el.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset['key'] as 'category' | 'crew' | 'status' | 'year';
        this.filter = { ...this.filter, [key]: btn.dataset['filter'] };
        this.redraw();
      });
    });

    this.el.querySelector<HTMLSelectElement>('[data-tech]')?.addEventListener('change', (e) => {
      this.filter = { ...this.filter, tech: (e.target as HTMLSelectElement).value };
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

/** 絞り込みパネルの 1 行(見出し + トグルボタン群) */
function filterRow<T extends string>(
  label: string,
  ariaLabel: string,
  key: keyof FilterState,
  options: readonly { id: T; label: string }[],
  current: T,
): string {
  return `
    <div class="filter-row" role="group" aria-label="${esc(ariaLabel)}">
      <span class="filter-row__label">${label}</span>
      ${options
        .map(
          (o) =>
            `<button class="filter-btn${current === o.id ? ' filter-btn--active' : ''}" data-filter="${o.id}" data-key="${key}">${o.label}</button>`,
        )
        .join('')}
    </div>`;
}

/** 個人制作かチーム制作かがひと目で分かるチップ(チームは人数付き) */
function crewChip(game: Game): string {
  const count = teamHeadcount(game);
  if (count === undefined) return '';
  return count === 1
    ? '<span class="crew-chip crew-chip--solo">SOLO</span>'
    : `<span class="crew-chip crew-chip--team">TEAM ×${count}</span>`;
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
  const upcoming = game.release.kind === 'coming-soon';
  const chip = game.release.kind !== 'archived' && game.release.store ? storeChip(game.release.store) : '';

  // ストア情報(バッジ+テキスト)と アクションボタン(PLAY NOW、詳細など)を分ける
  const storeInfo =
    game.release.kind === 'playable'
      ? `<span class="badge badge--play">PLAYABLE</span>${chip}`
      : `<span class="badge badge--soon">COMING SOON</span>${chip}`;

  const buttons =
    game.release.kind === 'playable'
      ? `<a class="btn btn--primary btn--lg" href="${esc(game.release.url)}" target="_blank" rel="noopener">${linkIcon(game.release.url)}PLAY NOW</a><span class="btn">${esc(t('details'))}</span>`
      : `${
          game.release.kind === 'coming-soon' && game.release.url
            ? `<a class="btn btn--lg" href="${esc(game.release.url)}" target="_blank" rel="noopener">${linkIcon(game.release.url)}${esc(t('steamPage'))}</a>`
            : ''
        }<span class="btn">${esc(t('details'))}</span>`;

  return `
    <article class="featured-card${released ? ' featured-card--released' : ''}${upcoming ? ' featured-card--upcoming' : ''}" data-entry="${game.entryNo}" tabindex="0">
      <div class="featured-card__label">${featuredLabel(game)}</div>
      <div class="featured-card__visual">
        <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
      </div>
      <div class="featured-card__body">
        <div class="featured-card__meta">
          <span class="featured-card__no">No.${String(game.entryNo).padStart(3, '0')}</span>
          ${crewChip(game)}
          ${game.year ? `<span class="featured-card__year">${esc(game.year)}</span>` : ''}
        </div>
        <span class="name-label">NAME</span>
        <h3 class="featured-card__title">${esc(game.title)}</h3>
        <p class="featured-card__desc">${esc(game.description)}</p>
        <div class="featured-card__store-info">${storeInfo}</div>
        <div class="featured-card__buttons">${buttons}</div>
      </div>
    </article>`;
}

function entryCard(game: Game): string {
  return `
    <li class="entry-card" data-entry="${game.entryNo}" tabindex="0">
      ${game.award ? `<span class="entry-card__award" title="${esc(game.award)}">🏆 ${esc(game.award)}</span>` : ''}
      <div class="entry-card__head">
        <span class="entry-card__no">No.${String(game.entryNo).padStart(3, '0')}</span>
        ${crewChip(game)}
        ${game.year ? `<span class="entry-card__year">${esc(game.year)}</span>` : ''}
      </div>
      <div class="entry-card__visual">
        <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
      </div>
      <span class="name-label">NAME</span>
      <h3 class="entry-card__title">${esc(game.title)}</h3>
      <p class="entry-card__tech">${game.technologies.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      <span class="entry-card__detail">▸ ${esc(t('viewDetails'))}</span>
    </li>`;
}
