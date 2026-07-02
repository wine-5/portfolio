import { View } from './View';
import { esc } from '../util/html';
import { navItems } from './navigation';

/** HUD 風ヘッダー。狭幅ではハンバーガーメニューに切り替わる */
export class Header extends View {
  constructor() {
    super('header', 'hud');
  }

  override render(): void {
    this.el.innerHTML = `
      <a class="hud__logo" href="#top">WINE-5</a>
      <nav class="hud__nav" id="hud-nav">
        ${navItems()
          .map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`)
          .join('')}
      </nav>
      <button class="hud__hamburger" aria-label="メニュー" aria-expanded="false" aria-controls="hud-nav">
        <span></span><span></span><span></span>
      </button>
    `;

    const button = this.el.querySelector<HTMLButtonElement>('.hud__hamburger')!;
    const toggle = (open?: boolean): void => {
      const next = open ?? !this.el.classList.contains('hud--open');
      this.el.classList.toggle('hud--open', next);
      button.setAttribute('aria-expanded', String(next));
    };
    button.addEventListener('click', () => toggle());
    // リンクを押したらメニューを閉じる
    this.el.querySelectorAll('#hud-nav a').forEach((a) => {
      a.addEventListener('click', () => toggle(false));
    });
  }
}
