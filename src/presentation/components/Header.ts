import { LOCALES, type Locale } from '@application/ports/Locale';
import { View } from './View';
import { esc } from '../util/html';
import { navItems } from './navigation';
import { t, LOCALE_NAMES } from '../i18n/uiStrings';
import { toggleTheme } from '../theme/themePreference';

export interface HeaderProps {
  /** 現在の表示言語(切り替え UI のアクティブ表示に使う) */
  readonly locale: Locale;
  /** 言語が選択されたときに App へ通知する */
  readonly onLocaleChange: (locale: Locale) => void;
  /** ターミナルを開きたいときに親へ通知する */
  readonly onTerminalToggle?: () => void;
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
        <button class="terminal-toggle" aria-label="Open terminal" title="Terminal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
        </button>
        ${themeToggle()}
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
    this.bindThemeToggle();
    this.bindTerminalToggle(props);
  }

  private bindThemeToggle(): void {
    const button = this.el.querySelector<HTMLButtonElement>('.theme-toggle')!;
    button.addEventListener('click', () => {
      const next = toggleTheme();
      button.setAttribute('aria-label', next === 'dark' ? t('toLightMode') : t('toDarkMode'));
    });
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

  private bindTerminalToggle(props: HeaderProps): void {
    const button = this.el.querySelector<HTMLButtonElement>('.terminal-toggle')!;
    button.addEventListener('click', () => {
      props.onTerminalToggle?.();
    });
  }
}

/** 太陽/月アイコンは両方描画し、data-theme に応じて CSS で表示を切り替える */
function themeToggle(): string {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return `
    <button class="theme-toggle" aria-label="${esc(isDark ? t('toLightMode') : t('toDarkMode'))}">
      <svg class="theme-toggle__sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg class="theme-toggle__moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>`;
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
