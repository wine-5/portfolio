import type { NewsItem, NewsType } from '@domain/entities/NewsItem';
import { View } from '../components/View';
import { esc } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/news.css';

const TYPE_LABEL: Record<NewsType, string> = {
  release: 'RELEASE',
  maintenance: 'MAINTENANCE',
  announcement: 'INFO',
};

/** 折りたたみ時に表示する件数(最新順の先頭から) */
const VISIBLE_COUNT = 3;

/** リリース情報などを流すニュースフィード。件数が増えても最新 3 件だけ見せ、残りは展開式にする */
export class NewsSection extends View<readonly NewsItem[]> {
  private onSelectGame?: (gameUrl: string) => void;
  private items: readonly NewsItem[] = [];
  private expanded = false;

  constructor() {
    super('section', 'news');
    this.el.id = 'news';
  }

  /** gameUrl 付きニュースをクリックした際に図鑑カードへ移動させるためのフック */
  setOnSelectGame(handler: (gameUrl: string) => void): void {
    this.onSelectGame = handler;
  }

  override render(items: readonly NewsItem[]): void {
    this.items = items;
    this.redraw();
  }

  private redraw(): void {
    const items = this.items;
    const hidden = Math.max(0, items.length - VISIBLE_COUNT);
    const shown = this.expanded ? items : items.slice(0, VISIBLE_COUNT);

    this.el.innerHTML = `
      <header class="news__header">
        <p class="news__kicker">// TRANSMISSION LOG</p>
        <h2 class="news__title">${esc(t('newsTitle'))}</h2>
      </header>
      ${
        items.length > 0
          ? `<ol class="news__list">${shown.map((n) => newsRow(n)).join('')}</ol>`
          : '<p class="news__empty">NO SIGNAL</p>'
      }
      ${
        hidden > 0
          ? `<button class="news__more" data-more aria-expanded="${this.expanded}">
               ${this.expanded ? `▴ ${esc(t('showLess'))}` : `▾ ${esc(t('showMore'))} (+${hidden})`}
             </button>`
          : ''
      }
    `;

    this.el.querySelector<HTMLButtonElement>('[data-more]')?.addEventListener('click', () => {
      this.expanded = !this.expanded;
      this.redraw();
      // 閉じたときにボタンが画面外へ飛ばないよう、セクション先頭へ戻す
      if (!this.expanded) this.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    this.el.querySelectorAll<HTMLAnchorElement>('[data-game-url]').forEach((node) => {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        const url = node.dataset['gameUrl'];
        if (url) this.onSelectGame?.(url);
      });
    });
  }
}

function newsRow(item: NewsItem): string {
  const body = `
    <div class="news-item__head">
      <time class="news-item__date" datetime="${esc(item.publishDate)}">${esc(item.publishDate)}</time>
      <span class="news-item__type news-item__type--${item.type}">${TYPE_LABEL[item.type]}</span>
    </div>
    <h3 class="news-item__title">${item.icon ? `${esc(item.icon)} ` : ''}${esc(item.title)}</h3>
    <p class="news-item__desc">${esc(item.description)}</p>
  `;

  // gameUrl 付きは図鑑カードへのナビゲーション(link より優先)、link 付きは通常のリンク
  const wrapped = item.gameUrl
    ? `<a class="news-item__link" href="#games" data-game-url="${esc(item.gameUrl)}">${body}</a>`
    : item.link
      ? `<a class="news-item__link" href="${esc(item.link)}">${body}</a>`
      : body;

  return `
    <li class="news-item">
      ${wrapped}
    </li>`;
}
