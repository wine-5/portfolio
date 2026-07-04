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
            <img src="${asset(game.thumbnailImage)}" alt="${esc(game.title)}" loading="lazy" />
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
