import { teamHeadcount, type Game } from '@domain/entities/Game';
import { View } from '../components/View';
import { GameDetailModal } from '../components/GameDetailModal';
import { esc, asset, linkIcon } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/flagship.css';

const VIDEO_RE = /\.(mp4|webm|mov)$/i;

/** ステージに出せるメディア。loop は自動再生ループ、video は ▶ を押してから読み込む */
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
            <div class="flagship__stage" data-stage>${mediaMain(media[0]!, game.title)}</div>
            ${
              media.length > 1
                ? `<div class="flagship__thumbs">
                    ${media
                      .map(
                        (m, i) => `
                          <button class="flagship-thumb${i === 0 ? ' flagship-thumb--active' : ''}" data-media="${i}" aria-label="${esc(game.title)} ${i + 1}">
                            ${thumbInner(m)}
                          </button>`,
                      )
                      .join('')}
                  </div>`
                : ''
            }
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

    this.setupStage(media, game);
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

  /** サムネ切り替え・▶ での動画読み込み・画面外での自動停止をまとめて配線する */
  private setupStage(media: readonly Media[], game: Game): void {
    const stage = this.el.querySelector<HTMLElement>('[data-stage]')!;
    let current = 0;

    // ループ動画は画面に入るまで src を付けない(先頭に置かれる想定)。
    // 画面外に出たら止めて、無駄な再生とバッテリー消費を避ける
    const loop = media[0]?.kind === 'loop' ? media[0] : undefined;
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

    const show = (index: number): void => {
      const item = media[index];
      if (!item || index === current) return;
      current = index;
      stage.innerHTML = mediaMain(item, game.title);
      // ループ動画へ戻ってきたときは監視が再発火しないので、その場で読み込んで再生する
      const video = stage.querySelector<HTMLVideoElement>('video[data-loop]');
      if (video) {
        video.src = asset(item.path);
        void video.play().catch(() => {});
      }
      bindPlay();
      this.el
        .querySelectorAll('.flagship-thumb--active')
        .forEach((n) => n.classList.remove('flagship-thumb--active'));
      this.el.querySelector(`[data-media="${index}"]`)?.classList.add('flagship-thumb--active');
    };

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

    this.el.querySelectorAll<HTMLButtonElement>('[data-media]').forEach((btn) => {
      btn.addEventListener('click', () => show(Number(btn.dataset['media'])));
    });
  }
}

/** 自動再生ループ → 手動再生動画 → スクリーンショット の順に並べる */
function buildMedia(game: Game): readonly Media[] {
  const shots = game.images.filter((p) => !VIDEO_RE.test(p));
  const poster = shots[0] ?? game.thumbnailImage;
  const fullVideo = game.images.find((p) => VIDEO_RE.test(p));

  const head: Media[] = game.flagshipVideo
    ? [{ kind: 'loop', path: game.flagshipVideo }]
    : fullVideo
      ? [{ kind: 'video', path: fullVideo, poster }]
      : [];

  return [...head, ...shots.map((path): Media => ({ kind: 'image', path }))];
}

function mediaMain(item: Media, title: string): string {
  switch (item.kind) {
    // src は IntersectionObserver が画面内に入ってから差し込む
    case 'loop':
      return '<video data-loop muted loop playsinline preload="none"></video>';
    case 'video':
      return `
        <img src="${esc(asset(item.poster))}" alt="${esc(title)}" />
        <button class="flagship__play" data-play="${esc(item.path)}" aria-label="${esc(t('playVideo'))}">
          <span class="flagship__play-icon" aria-hidden="true">▶</span>
          <span class="flagship__play-text">${esc(t('playVideo'))}</span>
        </button>`;
    case 'image':
      return `<img src="${esc(asset(item.path))}" alt="${esc(title)}" />`;
  }
}

function thumbInner(item: Media): string {
  return item.kind === 'image'
    ? `<img src="${esc(asset(item.path))}" alt="" loading="lazy" />`
    : '<span class="flagship-thumb__video" aria-hidden="true">▶</span>';
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
    ${game.githubUrl ? `<a class="btn btn--lg" href="${esc(game.githubUrl)}" target="_blank" rel="noopener">${linkIcon(game.githubUrl)}GITHUB</a>` : ''}
    <button class="btn btn--lg" data-detail>${esc(t('details'))}</button>`;
}
