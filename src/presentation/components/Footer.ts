import type { ProfileLink } from '@domain/entities/Profile';
import { View } from './View';
import { esc, asset } from '../util/html';
import { navItems } from './navigation';

export interface FooterProps {
  /** ソーシャルリンク(profile.json の links を流用) */
  readonly social: readonly ProfileLink[];
}

/** 旧サイトの構成(ブランド/ナビ/ソーシャル/法務/コピーライト)を踏襲したフッター */
export class Footer extends View<FooterProps> {
  constructor() {
    super('footer', 'footer');
  }

  override render(props: FooterProps): void {
    this.el.innerHTML = `
      <div class="footer__inner">
        <div class="footer__brand">
          <p class="footer__logo">WINE-5</p>
          <p class="footer__tagline">GAME DEVELOPER</p>
        </div>
        <div class="footer__columns">
          <section class="footer__section">
            <h4>NAVIGATION</h4>
            <ul>
              ${navItems()
                .map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`)
                .join('')}
            </ul>
          </section>
          <section class="footer__section">
            <h4>SOCIAL</h4>
            <ul>
              ${props.social
                .map(
                  (l) =>
                    `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`,
                )
                .join('')}
            </ul>
          </section>
          <section class="footer__section">
            <h4>LEGAL</h4>
            <ul>
              <li><a href="${asset('pages/legal/privacy.html')}">プライバシーポリシー</a></li>
            </ul>
          </section>
        </div>
        <p class="footer__copyright">&copy; ${new Date().getFullYear()} wine-5. All rights reserved.</p>
      </div>
    `;
  }
}
