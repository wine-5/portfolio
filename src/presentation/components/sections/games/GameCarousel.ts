import type { CodexEntryVM } from '@application/index';

/**
 * ゲームカルーセル: スライダー形式の看板作品表示。
 */
export class GameCarousel {
  private currentIndex = 0;
  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private featured: CodexEntryVM[]) {}

  render(): HTMLElement {
    if (this.featured.length === 0) {
      return document.createElement('div');
    }

    const container = document.createElement('div');
    container.className = 'game-carousel';

    // スライド トラック
    const track = document.createElement('div');
    track.className = 'game-carousel__track';

    this.featured.forEach((game, index) => {
      const slide = document.createElement('div');
      slide.className = 'game-carousel__slide';
      if (index === 0) slide.classList.add('game-carousel__slide--active');

      const thumbnail = document.createElement('img');
      thumbnail.src = game.thumbnailUrl;
      thumbnail.alt = game.title;
      thumbnail.className = 'game-carousel__image';
      slide.appendChild(thumbnail);

      // オーバーレイ
      const overlay = document.createElement('div');
      overlay.className = 'game-carousel__overlay';

      const title = document.createElement('h3');
      title.className = 'game-carousel__title';
      title.textContent = game.title;
      overlay.appendChild(title);

      const description = document.createElement('p');
      description.className = 'game-carousel__desc';
      description.textContent = game.description;
      overlay.appendChild(description);

      const actions = document.createElement('div');
      actions.className = 'game-carousel__actions';

      if (game.installUrl) {
        const playBtn = document.createElement('a');
        playBtn.href = game.installUrl;
        playBtn.target = '_blank';
        playBtn.className = 'btn btn--carousel-play';
        playBtn.textContent = '▸ プレイ';
        actions.appendChild(playBtn);
      }

      overlay.appendChild(actions);
      slide.appendChild(overlay);
      track.appendChild(slide);
    });

    container.appendChild(track);

    // 操作ボタン
    const prevBtn = document.createElement('button');
    prevBtn.className = 'game-carousel__btn game-carousel__btn--prev';
    prevBtn.setAttribute('aria-label', '前のスライド');
    prevBtn.textContent = '◀';
    prevBtn.addEventListener('click', () => this.prevSlide(track));
    container.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'game-carousel__btn game-carousel__btn--next';
    nextBtn.setAttribute('aria-label', '次のスライド');
    nextBtn.textContent = '▶';
    nextBtn.addEventListener('click', () => this.nextSlide(track));
    container.appendChild(nextBtn);

    // インジケーター
    const indicators = document.createElement('div');
    indicators.className = 'game-carousel__indicators';

    this.featured.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'game-carousel__indicator';
      if (index === 0) dot.classList.add('game-carousel__indicator--active');
      dot.setAttribute('aria-label', `スライド ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index, track, indicators));
      indicators.appendChild(dot);
    });

    container.appendChild(indicators);

    // オートプレイ
    this.startAutoPlay(track);

    return container;
  }

  private nextSlide(track: HTMLElement): void {
    this.currentIndex = (this.currentIndex + 1) % this.featured.length;
    this.updateSlide(track);
    this.updateIndicators(track.parentElement?.querySelector('.game-carousel__indicators'));
    this.resetAutoPlay(track);
  }

  private prevSlide(track: HTMLElement): void {
    this.currentIndex = (this.currentIndex - 1 + this.featured.length) % this.featured.length;
    this.updateSlide(track);
    this.updateIndicators(track.parentElement?.querySelector('.game-carousel__indicators'));
    this.resetAutoPlay(track);
  }

  private goToSlide(index: number, track: HTMLElement, indicators: HTMLElement): void {
    this.currentIndex = index;
    this.updateSlide(track);
    this.updateIndicators(indicators);
    this.resetAutoPlay(track);
  }

  private updateSlide(track: HTMLElement): void {
    const slides = track.querySelectorAll('.game-carousel__slide');
    slides.forEach((slide, index) => {
      if (index === this.currentIndex) {
        slide.classList.add('game-carousel__slide--active');
      } else {
        slide.classList.remove('game-carousel__slide--active');
      }
    });
  }

  private updateIndicators(indicators: HTMLElement | null | undefined): void {
    if (!indicators) return;

    const dots = indicators.querySelectorAll('.game-carousel__indicator');
    dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add('game-carousel__indicator--active');
      } else {
        dot.classList.remove('game-carousel__indicator--active');
      }
    });
  }

  private startAutoPlay(track: HTMLElement): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide(track);
    }, 6000); // 6秒ごと
  }

  private resetAutoPlay(track: HTMLElement): void {
    if (this.autoPlayInterval !== null) {
      clearInterval(this.autoPlayInterval);
    }
    this.startAutoPlay(track);
  }
}

/**
 * GameCarousel CSS。
 */
export const GAME_CAROUSEL_STYLES = `
.game-carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: var(--space-8);
  border: 3px solid var(--line);
  background: var(--bg-window);
  box-shadow: var(--window-shadow);
  overflow: hidden;
}

.game-carousel__track {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-carousel__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 600ms ease-out;
  pointer-events: none;
}

.game-carousel__slide--active {
  opacity: 1;
  pointer-events: auto;
  z-index: 10;
}

.game-carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.game-carousel__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.9) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-6);
  color: white;
}

.game-carousel__title {
  font-family: var(--font-pixel);
  font-size: clamp(1.4rem, 5vw, 2.2rem);
  color: var(--select);
  margin: 0 0 var(--space-2) 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.game-carousel__desc {
  font-size: clamp(0.8rem, 2vw, 1rem);
  color: #fff;
  margin: 0 0 var(--space-4) 0;
  line-height: 1.6;
  max-width: 600px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.game-carousel__actions {
  display: flex;
  gap: var(--space-3);
}

.btn--carousel-play {
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--select);
  background: rgba(245, 197, 66, 0.2);
  color: var(--select);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 150ms;
  backdrop-filter: blur(4px);
}

.btn--carousel-play:hover {
  background: var(--select);
  color: var(--bg-primary);
  transform: scale(1.05);
}

.game-carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--accent);
  color: var(--accent);
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 150ms;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-carousel__btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 0 12px var(--accent);
}

.game-carousel__btn--prev {
  left: var(--space-4);
}

.game-carousel__btn--next {
  right: var(--space-4);
}

.game-carousel__indicators {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-2);
  z-index: 20;
}

.game-carousel__indicator {
  width: 12px;
  height: 12px;
  border: 2px solid var(--accent);
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 150ms;
}

.game-carousel__indicator--active {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.game-carousel__indicator:hover {
  transform: scale(1.2);
}

@media (max-width: 640px) {
  .game-carousel__overlay {
    padding: var(--space-4);
  }

  .game-carousel__title {
    font-size: 1.2rem;
  }

  .game-carousel__desc {
    font-size: 0.8rem;
    margin-bottom: var(--space-2);
  }

  .game-carousel__btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
`;
