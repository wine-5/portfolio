import type { Game } from '@domain/entities/Game';
import { View } from './View';
import { esc, asset, storeChip } from '../util/html';
import { t } from '../i18n/uiStrings';

/** 図鑑エントリをクリックしたときのステータス詳細画面 */
export class GameDetailModal extends View<Game> {
  private readonly onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  constructor() {
    super('div', 'game-modal');
  }

  override render(game: Game): void {
    // 掲載メディア(画像+動画)。images が空なら図鑑サムネイルで代用
    const media = game.images.length > 0 ? game.images : [game.thumbnailImage];

    this.el.innerHTML = `
      <div class="game-modal__backdrop" data-close></div>
      <article class="game-modal__panel" role="dialog" aria-modal="true" aria-label="${esc(game.title)}">
        <button class="game-modal__close" data-close aria-label="${esc(t('close'))}">×</button>
        <header class="game-modal__header">
          <span class="game-modal__no">No.${String(game.entryNo).padStart(3, '0')}</span>
          <div class="game-modal__name">
            <span class="game-modal__name-label">NAME</span>
            <h3 class="game-modal__title">${esc(game.title)}</h3>
          </div>
          ${releaseBadge(game)}
        </header>
        <div class="game-modal__body">
          <div class="game-modal__visual">
            <div class="game-modal__stage" data-stage>${mediaMain(media[0]!, game.title)}</div>
            ${
              media.length > 1
                ? `<div class="game-modal__thumbs">
                    ${media
                      .map(
                        (m, i) => `
                          <button class="media-thumb${i === 0 ? ' media-thumb--active' : ''}" data-media="${i}" aria-label="${esc(game.title)} ${i + 1}">
                            ${thumbInner(m)}
                          </button>`,
                      )
                      .join('')}
                  </div>`
                : ''
            }
          </div>
          <div class="game-modal__info">
            <p class="game-modal__desc">${esc(game.description)}</p>
            ${infoBlock(t('overview'), game.detailedFeatures)}
            ${infoBlock(t('responsibilities'), game.myResponsibilities)}
            <dl class="game-modal__meta">
              ${metaRow('TECH', game.technologies.join(' / '))}
              ${metaRow('PLATFORM', game.supportedPlatforms.join(' / '))}
              ${metaRow('TEAM', game.teamSize)}
              ${metaRow('PERIOD', game.period)}
              ${metaRow('AWARD', game.award ? `🏆 ${game.award}` : '')}
            </dl>
            <div class="game-modal__links">
              ${game.release.kind === 'playable' ? `<a class="btn btn--primary" href="${esc(game.release.url)}" target="_blank" rel="noopener">PLAY NOW</a>` : ''}
              ${game.release.kind === 'coming-soon' && game.release.url ? `<a class="btn btn--primary" href="${esc(game.release.url)}" target="_blank" rel="noopener">${esc(t('steamPage'))}</a>` : ''}
              ${game.githubUrl ? `<a class="btn" href="${esc(game.githubUrl)}" target="_blank" rel="noopener">GITHUB</a>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;

    this.el.querySelectorAll('[data-close]').forEach((n) => {
      n.addEventListener('click', () => this.close());
    });

    // サムネイルクリックでメインの画像/動画を切り替える
    const stage = this.el.querySelector<HTMLElement>('[data-stage]')!;
    this.el.querySelectorAll<HTMLButtonElement>('[data-media]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const path = media[Number(btn.dataset['media'])];
        if (!path) return;
        stage.innerHTML = mediaMain(path, game.title);
        this.el
          .querySelectorAll('.media-thumb--active')
          .forEach((n) => n.classList.remove('media-thumb--active'));
        btn.classList.add('media-thumb--active');
      });
    });
  }

  open(game: Game): void {
    this.render(game);
    this.mount(document.body);
    document.addEventListener('keydown', this.onKeydown);
    // スクロールバーが消える分の幅を余白で補い、背景のズレ(ガタつき)を防ぐ
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
    document.body.style.overflow = 'hidden';
    // マウント後にクラスを付けて開閉アニメーションを発火させる
    requestAnimationFrame(() => this.el.classList.add('game-modal--open'));
  }

  close(): void {
    document.removeEventListener('keydown', this.onKeydown);
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this.el.classList.remove('game-modal--open');
    window.setTimeout(() => this.unmount(), 200);
  }
}

const VIDEO_RE = /\.(mp4|webm|mov)$/i;

/** メイン表示エリア: 動画なら再生コントロール付き、画像ならそのまま */
function mediaMain(path: string, title: string): string {
  return VIDEO_RE.test(path)
    ? `<video src="${esc(asset(path))}" controls playsinline preload="metadata"></video>`
    : `<img src="${esc(asset(path))}" alt="${esc(title)}" loading="lazy" />`;
}

/** サムネイル: 動画は ▶ タイル、画像は縮小表示 */
function thumbInner(path: string): string {
  return VIDEO_RE.test(path)
    ? '<span class="media-thumb__video" aria-hidden="true">▶</span>'
    : `<img src="${esc(asset(path))}" alt="" loading="lazy" />`;
}

function releaseBadge(game: Game): string {
  switch (game.release.kind) {
    case 'coming-soon':
      return `<span class="badge badge--soon">COMING SOON</span>${game.release.store ? storeChip(game.release.store) : ''}`;
    case 'playable':
      return `<span class="badge badge--play">PLAYABLE</span>${game.release.store ? storeChip(game.release.store) : ''}`;
    case 'archived':
      return '';
  }
}

function infoBlock(label: string, text: string): string {
  if (!text) return '';
  return `
    <section class="game-modal__block">
      <h4>${esc(label)}</h4>
      <p>${esc(text).replace(/\n/g, '<br />')}</p>
    </section>`;
}

function metaRow(label: string, value: string): string {
  if (!value) return '';
  return `<div class="meta-row"><dt>${label}</dt><dd>${esc(value)}</dd></div>`;
}
