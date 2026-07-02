import type { NewsItem, NewsType } from '@domain/entities/NewsItem';
import { View } from '../components/View';
import { esc } from '../util/html';
import '../styles/news.css';

const TYPE_LABEL: Record<NewsType, string> = {
  release: 'RELEASE',
  maintenance: 'MAINTENANCE',
  announcement: 'INFO',
};

/** リリース情報などを流すニュースフィード */
export class NewsSection extends View<readonly NewsItem[]> {
  constructor() {
    super('section', 'news');
    this.el.id = 'news';
  }

  override render(items: readonly NewsItem[]): void {
    this.el.innerHTML = `
      <header class="news__header">
        <p class="news__kicker">// TRANSMISSION LOG</p>
        <h2 class="news__title">NEWS</h2>
      </header>
      ${
        items.length > 0
          ? `<ol class="news__list">${items.map((n) => newsRow(n)).join('')}</ol>`
          : '<p class="news__empty">NO SIGNAL</p>'
      }
    `;
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

  return `
    <li class="news-item">
      ${item.link ? `<a class="news-item__link" href="${esc(item.link)}">${body}</a>` : body}
    </li>`;
}
