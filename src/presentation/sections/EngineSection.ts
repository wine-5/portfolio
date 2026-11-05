import type { Engine } from '@domain/entities/Engine';
import type { Game } from '@domain/entities/Game';
import { View } from '../components/View';
import { esc, asset } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/engine.css';

/** EngineSection に渡すもの。works の ID から作品を引くために全作品も受け取る */
export interface EngineViewProps {
  readonly engine: Engine;
  readonly games: readonly Game[];
}

/**
 * 自作ゲームエンジン(WineEngine)を紹介するセクション(図鑑の下に置く)。
 * 作品ではなく「作品を作る道具」を見せ、このエンジンで作った作品へ飛べるようにするのが役割。
 */
export class EngineSection extends View<EngineViewProps> {
  private onSelectGame: (entryNo: number) => void = () => {};

  constructor() {
    super('section', 'engine');
    this.el.id = 'engine';
  }

  /** 「このエンジンで作った作品」を押したときに、その作品の図鑑カードへ移動する処理 */
  setOnSelectGame(handler: (entryNo: number) => void): void {
    this.onSelectGame = handler;
  }

  override render({ engine, games }: EngineViewProps): void {
    const works = engine.works
      .map((id) => games.find((g) => g.thumbnailImage.includes(`/${id}/`)))
      .filter((g): g is Game => g !== undefined);

    this.el.innerHTML = `
      <header class="engine__header">
        <p class="engine__kicker">// ENGINE</p>
        <h2 class="engine__title">${esc(engine.name)}</h2>
        <p class="engine__tagline">${esc(engine.tagline)}</p>
      </header>
      <div class="engine__frame">
        <p class="engine__summary">${esc(engine.summary)}</p>
        <dl class="engine__stats">
          ${engine.stats
            .map(
              (s) => `
                <div class="engine-stat">
                  <dt>${esc(s.label)}</dt>
                  <dd>${esc(s.value)}</dd>
                </div>`,
            )
            .join('')}
        </dl>
        <div class="engine__figures">
          ${engine.figures
            .map(
              (f) => `
                <figure class="engine-figure">
                  <img src="${esc(asset(f.src))}" alt="${esc(f.caption)}" loading="lazy" decoding="async" />
                  <figcaption>${esc(f.caption)}</figcaption>
                </figure>`,
            )
            .join('')}
        </div>
        <ul class="engine__pillars">
          ${engine.pillars
            .map(
              (p) => `
                <li class="engine-pillar">
                  <h3 class="engine-pillar__title">${esc(p.title)}</h3>
                  <p class="engine-pillar__body">${esc(p.body)}</p>
                </li>`,
            )
            .join('')}
        </ul>
        <p class="engine__tags">${engine.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</p>
        ${
          works.length > 0
            ? `<div class="engine__works">
                <p class="engine__works-label">${esc(t('engineWorks'))}</p>
                <ul class="engine__works-list">
                  ${works
                    .map(
                      (g) => `
                        <li>
                          <button class="engine-work" data-entry="${g.entryNo}">
                            <img src="${esc(asset(g.carouselImage ?? g.thumbnailImage))}" alt="" loading="lazy" decoding="async" />
                            <span>${esc(g.title)}</span>
                          </button>
                        </li>`,
                    )
                    .join('')}
                </ul>
              </div>`
            : ''
        }
      </div>
    `;

    this.el.querySelectorAll<HTMLButtonElement>('[data-entry]').forEach((button) => {
      button.addEventListener('click', () => this.onSelectGame(Number(button.dataset['entry'])));
    });
  }
}
