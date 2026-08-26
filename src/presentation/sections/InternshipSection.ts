import type { Internship } from '@domain/entities/Internship';
import { View } from '../components/View';
import { esc } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/internship.css';

/** インターンシップ経験を任務記録風カードで見せるセクション */
export class InternshipSection extends View<readonly Internship[]> {
  constructor() {
    super('section', 'internship');
    this.el.id = 'internship';
  }

  override render(items: readonly Internship[]): void {
    this.el.innerHTML = `
      <header class="internship__header">
        <p class="internship__kicker">// MISSION LOG</p>
        <h2 class="internship__title">${esc(t('internshipTitle'))}</h2>
      </header>
      ${items.map((item) => card(item)).join('')}
    `;
  }
}

function card(item: Internship): string {
  return `
    <article class="internship-card">
      <div class="internship-card__head">
        <div class="internship-card__company-block">
          <h3 class="internship-card__company">${esc(item.company)}</h3>
          <p class="internship-card__period">${esc(item.period)}</p>
        </div>
        <div class="internship-card__theme-block">
          <p class="internship-card__theme">
            <span class="internship-card__theme-label">${esc(t('internshipTheme'))}:</span>
            ${esc(item.theme)}
          </p>
          <ul class="internship-card__tags">
            ${item.tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}
          </ul>
        </div>
      </div>
      <p class="internship-card__summary">${esc(item.summary)}</p>
      ${
        item.learnings.length > 0
          ? `<ul class="internship-card__learnings">
              ${item.learnings
                .map(
                  (l) => `
                    <li class="internship-learning">
                      <h4 class="internship-learning__title">${esc(l.title)}</h4>
                      <p class="internship-learning__body">${esc(l.body)}</p>
                    </li>`,
                )
                .join('')}
            </ul>`
          : ''
      }
    </article>`;
}
