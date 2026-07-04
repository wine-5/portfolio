import { LOCALES, type Locale } from '@application/ports/Locale';
import { View } from './View';
import { esc } from '../util/html';
import { navItems } from './navigation';
import { t, LOCALE_NAMES } from '../i18n/uiStrings';

export interface HeaderProps {
  /** 現在の表示言語(切り替え UI のアクティブ表示に使う) */
  readonly locale: Locale;
  /** 言語が選択されたときに App へ通知する */
  readonly onLocaleChange: (locale: Locale) => void;
}

/** HUD 風ヘッダー。狭幅ではハンバーガーメニューに切り替わる */
export class Header extends View<HeaderProps> {
  constructor() {
    super('header', 'hud');
  }

  override render(props: HeaderProps): void {
    this.el.innerHTML = `
      <a class="hud__logo" href="#top">WINE-5</a>
      <nav class="hud__nav" id="hud-nav">
        ${navItems()
          .map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`)
          .join('')}
      </nav>
      <div class="hud__tools">
        ${languageSwitcher(props.locale)}
        <button class="hud__hamburger" aria-label="${esc(t('menu'))}" aria-expanded="false" aria-controls="hud-nav">
          <span></span><span></span><span></span>
        </button>
      </div>
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

    this.bindLanguageSwitcher(props);
  }

  private bindLanguageSwitcher(props: HeaderProps): void {
    const switcher = this.el.querySelector<HTMLElement>('.lang-switcher')!;
    const openButton = switcher.querySelector<HTMLButtonElement>('.lang-switcher__button')!;

    openButton.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('lang-switcher--open');
    });
    // ドロップダウン外をクリックしたら閉じる
    document.addEventListener('click', () => switcher.classList.remove('lang-switcher--open'));

    switcher.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((option) => {
      option.addEventListener('click', () => {
        const locale = option.dataset['locale'] as Locale;
        switcher.classList.remove('lang-switcher--open');
        if (locale !== props.locale) props.onLocaleChange(locale);
      });
    });
  }
}

function languageSwitcher(current: Locale): string {
  return `
    <div class="lang-switcher">
      <button class="lang-switcher__button" aria-label="${esc(t('switchLanguage'))}" aria-haspopup="listbox">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2c2.5 2.6 4 6.2 4 10s-1.5 7.4-4 10c-2.5-2.6-4-6.2-4-10s1.5-7.4 4-10z" />
        </svg>
        <span>${esc(LOCALE_NAMES[current])}</span>
      </button>
      <div class="lang-switcher__dropdown" role="listbox">
        ${LOCALES.map(
          (locale) => `
            <button role="option" aria-selected="${locale === current}" data-locale="${locale}"
              class="lang-switcher__option${locale === current ? ' lang-switcher__option--active' : ''}">
              ${esc(LOCALE_NAMES[locale])}
            </button>`,
        ).join('')}
      </div>
    </div>`;
}
