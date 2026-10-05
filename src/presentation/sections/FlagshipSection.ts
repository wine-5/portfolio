import { teamHeadcount, type Game } from '@domain/entities/Game';
import { View } from '../components/View';
import { GameDetailModal } from '../components/GameDetailModal';
import { esc, asset, linkIcon } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/flagship.css';

const VIDEO_RE = /\.(mp4|webm|mov)$/i;

/** 枠に出すメディア。loop は自動再生ループ、video は ▶ を押してから読み込む、image は動画が無い作品の静止画 */
type Media =
  | { readonly kind: 'loop'; readonly path: string }
  | { readonly kind: 'video'; readonly path: string; readonly poster: string }
  | { readonly kind: 'image'; readonly path: string };

/**
 * 看板作品を 1 つだけ別格で見せるセクション(図鑑の上に置く)。
 * 図鑑カードでは埋もれてしまう「プレイ映像」と「刺さる訴求 3 点」を表に出すのが役割。
 */
export class FlagshipSection extends View<Game> {
  private readonly modal = new GameDetailModal();
  private observer: IntersectionObserver | null = null;

  constructor() {
    super('section', 'flagship');
    this.el.id = 'flagship';
  }

  override render(game: Game): void {
    // 人気作のカードと同じく、画像の一覧は出さず映像 1 つだけを大きく見せる(画像は詳細で見られる)
    const media = buildMedia(game);
    const headcount = teamHeadcount(game);

    this.el.innerHTML = `
      <div class="flagship__frame">
        <header class="flagship__header">
          <p class="flagship__kicker">// FLAGSHIP</p>
          <span class="flagship__rank">LEGENDARY</span>
          <span class="flagship__no">No.${String(game.entryNo).padStart(3, '0')}</span>
        </header>
        <div class="flagship__body">
          <div class="flagship__visual">
            <div class="flagship__stage" data-stage>${mediaMain(media, game.title)}</div>
          </div>
          <div class="flagship__info">
            <p class="flagship__lead">${esc(t('flagshipLead'))}</p>
            <h2 class="flagship__title">${esc(game.title)}</h2>
            <p class="flagship__desc">${esc(game.description)}</p>
            ${
              game.highlights.length > 0
                ? `<ul class="flagship__highlights">
                    ${game.highlights
                      .map(
                        (h) => `
                          <li class="flagship-point">
                            <h3 class="flagship-point__title">${esc(h.title)}</h3>
                            <p class="flagship-point__body">${esc(h.body)}</p>
                          </li>`,
                      )
                      .join('')}
                  </ul>`
                : ''
            }
            <dl class="flagship__stats">
              ${statCell('TEAM', headcount === 1 ? 'SOLO' : headcount !== undefined ? `TEAM ×${headcount}` : game.teamSize)}
              ${statCell('PERIOD', game.period)}
              ${statCell('CORE', game.technologies[0] ?? '')}
            </dl>
            <p class="flagship__tech">${game.technologies.map((tech) => `<span>${esc(tech)}</span>`).join('')}</p>
            <div class="flagship__actions">${actions(game)}</div>
          </div>
        </div>
      </div>
    `;

    this.setupStage(media);
    this.el
      .querySelector('[data-detail]')
      ?.addEventListener('click', () => this.modal.open(game));
  }

  /** ヒーローのアイコンや Skills/News からこの枠へ飛んできたときのスクロール */
  focus(): void {
    this.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  override unmount(): void {
    this.observer?.disconnect();
    this.observer = null;
    super.unmount();
  }

  /** ▶ での動画読み込みと、ループ動画の画面外での自動停止を配線する */
  private setupStage(media: Media): void {
    const stage = this.el.querySelector<HTMLElement>('[data-stage]')!;

    // ループ動画は画面に入るまで src を付けない。
    // 画面外に出たら止めて、無駄な再生とバッテリー消費を避ける
    const loop = media.kind === 'loop' ? media : undefined;
    if (loop && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const video = stage.querySelector<HTMLVideoElement>('video[data-loop]');
          if (!video) return;
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (!video.src) video.src = asset(loop.path);
              void video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        },
        { rootMargin: '200px' },
      );
      this.observer.observe(this.el);
    }

    // ▶ を押したときだけ実データを読み込む(重い動画を初期表示から外す)
    const bindPlay = (): void => {
      const button = stage.querySelector<HTMLButtonElement>('[data-play]');
      if (!button) return;
      button.addEventListener('click', () => {
        const path = button.dataset['play']!;
        stage.innerHTML = `<video src="${esc(asset(path))}" controls autoplay playsinline></video>`;
      });
    };
    bindPlay();
  }
}

/** 自動再生ループ → 手動再生動画 → 静止画 の順で、使えるものを 1 つ選ぶ */
function buildMedia(game: Game): Media {
  const poster = game.images.find((p) => !VIDEO_RE.test(p)) ?? game.thumbnailImage;
  const fullVideo = game.images.find((p) => VIDEO_RE.test(p));
  if (game.flagshipVideo) return { kind: 'loop', path: game.flagshipVideo };
  if (fullVideo) return { kind: 'video', path: fullVideo, poster };
  return { kind: 'image', path: poster };
}

function mediaMain(item: Media, title: string): string {
  switch (item.kind) {
    // src は IntersectionObserver が画面内に入ってから差し込む
    case 'loop':
      return '<video data-loop muted loop playsinline preload="none"></video>';
    case 'video':
      return `
        <img src="${esc(asset(item.poster))}" alt="${esc(title)}" decoding="async" />
        <button class="flagship__play" data-play="${esc(item.path)}" aria-label="${esc(t('playVideo'))}">
          <span class="flagship__play-icon" aria-hidden="true">▶</span>
          <span class="flagship__play-text">${esc(t('playVideo'))}</span>
        </button>`;
    case 'image':
      return `<img src="${esc(asset(item.path))}" alt="${esc(title)}" decoding="async" />`;
  }
}

function statCell(label: string, value: string): string {
  if (!value) return '';
  return `<div class="flagship-stat"><dt>${label}</dt><dd>${esc(value)}</dd></div>`;
}

function actions(game: Game): string {
  const primary =
    game.downloadUrl ??
    (game.release.kind === 'playable'
      ? game.release.url
      : game.release.kind === 'coming-soon'
        ? game.release.url
        : undefined);
  // GitHub の Releases ページに飛ばす作品は「遊ぶ」より「落とす」が実態に近い
  const primaryLabel = primary?.includes('/releases') ? 'DOWNLOAD' : 'PLAY NOW';

  return `
    ${primary ? `<a class="btn btn--primary btn--lg" href="${esc(primary)}" target="_blank" rel="noopener">${linkIcon(primary)}${primaryLabel}</a>` : ''}
    ${game.websiteUrl ? `<a class="btn btn--lg" href="${esc(game.websiteUrl)}" target="_blank" rel="noopener">${esc(t('officialSite'))}</a>` : ''}
    ${game.githubUrl ? `<a class="btn btn--lg" href="${esc(game.githubUrl)}" target="_blank" rel="noopener">${linkIcon(game.githubUrl)}GITHUB</a>` : ''}
    <button class="btn btn--lg" data-detail>${esc(t('details'))}</button>`;
}
