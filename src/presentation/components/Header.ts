import { LOCALES, type Locale } from '@application/ports/Locale';
import { View } from './View';
import { esc } from '../util/html';
import { navItems } from './navigation';
import { t, LOCALE_NAMES } from '../i18n/uiStrings';
import { currentTheme, setTheme, type Theme } from '../theme/themePreference';
import { detectBackground, persistBackground, type BackgroundKind } from '../background/backgroundPreference';
import { showBackground } from '../background/backgroundSwitcher';

export interface HeaderProps {
  /** 現在の表示言語(切り替え UI のアクティブ表示に使う) */
  readonly locale: Locale;
  /** 言語が選択されたときに App へ通知する */
  readonly onLocaleChange: (locale: Locale) => void;
  /** 描画直後から設定パネルを開いておく(パネル内で言語を切り替えて再描画したとき) */
  readonly settingsOpen?: boolean;
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
        ${settingsMenu(props.locale)}
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

    this.bindSettings(props);
  }

  private bindSettings(props: HeaderProps): void {
    const root = this.el.querySelector<HTMLElement>('.settings')!;
    const button = root.querySelector<HTMLButtonElement>('.settings__button')!;
    const panel = root.querySelector<HTMLElement>('.settings__panel')!;

    const setOpen = (open: boolean): void => {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      root.classList.toggle('settings--open', open);
    };
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(panel.hidden);
    });
    root.querySelector('.settings__close')!.addEventListener('click', () => {
      setOpen(false);
      button.focus();
    });
    // パネルの外をクリック / Esc で閉じる(ヘッダーは言語切り替えで作り直されるので、外れたら登録も解除する)
    const onDocClick = (e: MouseEvent): void => {
      if (!this.el.isConnected) return document.removeEventListener('click', onDocClick);
      if (!root.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (!this.el.isConnected) return document.removeEventListener('keydown', onKey);
      if (e.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        button.focus();
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);

    // 各設定はその場で反映する(保存ボタンは置かない)
    root.querySelectorAll<HTMLButtonElement>('[data-setting]').forEach((option) => {
      option.addEventListener('click', () => {
        const value = option.dataset['value']!;
        option.parentElement!.querySelectorAll('[data-setting]').forEach((o) => {
          o.setAttribute('aria-checked', String(o === option));
        });
        switch (option.dataset['setting']) {
          case 'theme':
            setTheme(value as Theme);
            break;
          case 'background':
            persistBackground(value as BackgroundKind);
            void showBackground(value as BackgroundKind);
            break;
          case 'locale':
            if (value !== props.locale) props.onLocaleChange(value as Locale);
            break;
        }
      });
    });

    if (props.settingsOpen) setOpen(true);
  }
}

/** ラジオボタン風の切り替え(選択中を aria-checked で示す) */
function segment(setting: string, label: string, options: readonly (readonly [string, string])[], current: string): string {
  return `
    <div class="settings__group">
      <span class="settings__legend" id="settings-${setting}">${esc(label)}</span>
      <div class="settings__segment" role="radiogroup" aria-labelledby="settings-${setting}">
        ${options
          .map(
            ([value, text]) => `
              <button type="button" role="radio" class="settings__option" data-setting="${setting}" data-value="${value}"
                aria-checked="${value === current}">${esc(text)}</button>`,
          )
          .join('')}
      </div>
    </div>`;
}

/** ヘッダー右上の設定ボタンと、テーマ / 言語 / 背景をまとめて切り替えるパネル */
function settingsMenu(locale: Locale): string {
  return `
    <div class="settings">
      <button class="settings__button" aria-label="${esc(t('settings'))}" aria-haspopup="dialog" aria-expanded="false" aria-controls="settings-panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span class="settings__button-label">${esc(t('settings'))}</span>
      </button>
      <div class="settings__panel" id="settings-panel" role="dialog" aria-label="${esc(t('settings'))}" hidden>
        <div class="settings__head">
          <span class="settings__title">// SETTINGS</span>
          <button type="button" class="settings__close" aria-label="${esc(t('close'))}">×</button>
        </div>
        ${segment('theme', t('settingsTheme'), [['dark', t('themeDark')], ['light', t('themeLight')]], currentTheme())}
        ${segment('locale', t('settingsLanguage'), LOCALES.map((l) => [l, LOCALE_NAMES[l]] as const), locale)}
        ${segment('background', t('settingsBackground'), [['depth', t('backgroundDepth')], ['classic', t('backgroundClassic')]], detectBackground())}
        <p class="settings__note">${esc(t('settingsNote'))}</p>
      </div>
    </div>`;
}
