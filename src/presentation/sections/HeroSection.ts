import type { Game } from '@domain/entities/Game';
import { View } from '../components/View';
import { GameCarousel } from '../components/GameCarousel';
import '../styles/hero.css';

/** 最上部のヒーロー演出: wine-5 タイトル(反射付き) + 回転ゲームカルーセル */
export class HeroSection extends View<readonly Game[]> {
  private readonly carousel = new GameCarousel();

  constructor() {
    super('section', 'hero');
    this.el.id = 'top';
  }

  setOnSelect(fn: (entryNo: number) => void): void {
    this.carousel.setOnSelect(fn);
  }

  override render(games: readonly Game[]): void {
    const letters = 'wine-5'
      .split('')
      .map((c, i) => `<span class="hero__letter" style="--i: ${i}">${c}</span>`)
      .join('');

    this.el.innerHTML = `
      <div class="hero__title-wrap">
        <h1 class="hero__title">${letters}</h1>
        <p class="hero__subtitle">GAME DEVELOPER</p>
      </div>
      <div class="hero__carousel"></div>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#games">VIEW GAMES</a>
      </div>
      <div class="hero__scroll" aria-hidden="true">
        <span>SCROLL DOWN</span>
        <i class="hero__scroll-chevron"></i>
      </div>
    `;

    this.carousel.render(
      games.map((g) => ({ entryNo: g.entryNo, title: g.title, image: g.carouselImage ?? g.thumbnailImage })),
    );
    this.carousel.mount(this.el.querySelector<HTMLElement>('.hero__carousel')!);
  }
}
