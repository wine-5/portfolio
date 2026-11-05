import type { Engine, EngineStep } from '@domain/entities/Engine';
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
 * 作品ではなく「作品を作る道具」を見せるのが役割で、
 * 「AI がエンジンを操作して作る」様子を実際のエディタ画面で順に見せる(依頼 → 操作 → 記録)。
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
        <h2 class="engine__title">${esc(engine.name)}<span class="engine__status">${esc(engine.status)}</span></h2>
        <p class="engine__motto">${esc(engine.motto)}</p>
        <p class="engine__tagline">${esc(engine.tagline)}</p>
      </header>
      <div class="engine__frame">
        <ul class="engine__concepts">
          ${engine.concepts.map((c) => `<li>${esc(c)}</li>`).join('')}
        </ul>
        <p class="engine__summary">${esc(engine.summary)}</p>
        ${engine.steps.length > 0 ? `<ol class="engine__steps">${engine.steps.map(stepCard).join('')}</ol>` : ''}
        ${historyAndShared(engine)}
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
        ${worksList(works)}
      </div>
    `;

    this.el.querySelectorAll<HTMLButtonElement>('[data-entry]').forEach((button) => {
      button.addEventListener('click', () => this.onSelectGame(Number(button.dataset['entry'])));
    });
  }
}

/** STEP 1〜3 の 1 枚。画像があれば画像、無ければ依頼の文面を吹き出しで見せる */
function stepCard(step: EngineStep): string {
  const media = step.src
    ? `<img src="${esc(asset(step.src))}" alt="${esc(step.title)}" loading="lazy" decoding="async" />`
    : `<div class="engine-chat">
        ${step.promptNote ? `<span class="engine-chat__note">${esc(step.promptNote)}</span>` : ''}
        <p class="engine-chat__bubble">${esc(step.prompt ?? '')}</p>
      </div>`;

  return `
    <li class="engine-step">
      <p class="engine-step__label">${esc(step.label)}</p>
      <div class="engine-step__head">
        <h3 class="engine-step__title">${esc(step.title)}</h3>
        <span class="engine-step__app">${esc(step.app)}</span>
      </div>
      <div class="engine-step__media">${media}</div>
      <p class="engine-step__caption">${esc(step.caption)}</p>
    </li>`;
}

/** AI が使ったコマンドの履歴と、「配って使ってもらっている」の枠を横に並べる */
function historyAndShared(engine: Engine): string {
  const { history, shared } = engine;
  if (!history && !shared) return '';

  return `
    <div class="engine__record">
      ${
        history
          ? `<figure class="engine-history">
              <p class="engine-history__title">${esc(history.title)}</p>
              <img src="${esc(asset(history.src))}" alt="${esc(history.title)}" loading="lazy" decoding="async" />
              <figcaption>${esc(history.caption)}</figcaption>
            </figure>`
          : ''
      }
      ${
        shared
          ? `<aside class="engine-shared">
              <h3 class="engine-shared__title">${esc(shared.title)}</h3>
              <p class="engine-shared__body">${esc(shared.body)}</p>
            </aside>`
          : ''
      }
    </div>`;
}

/** 「このエンジンで作った作品」のチップ列 */
function worksList(works: readonly Game[]): string {
  if (works.length === 0) return '';

  return `
    <div class="engine__works">
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
    </div>`;
}
