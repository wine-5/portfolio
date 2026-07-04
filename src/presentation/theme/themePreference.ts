export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** 旧サイト(JS 版)と同じキーを使い、テーマ設定を引き継げるようにする */
const STORAGE_KEY = 'theme';

const DEFAULT_THEME: Theme = 'dark';

function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

/**
 * 表示テーマを検出する。
 * 優先順位: localStorage > システム設定(prefers-color-scheme) > デフォルト(dark)
 */
export function detectTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isTheme(stored)) return stored;

  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';

  return DEFAULT_THEME;
}

/** テーマを DOM に反映する(CSS は data-theme 属性で切り替わる) */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/** テーマを切り替えて保存し、切り替え後のテーマを返す(画面全体をフェードで遷移させる) */
export function toggleTheme(): Theme {
  const next: Theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  crossFade(() => applyTheme(next));
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

/**
 * テーマの急な切り替わりを和らげるクロスフェード。
 * View Transitions API 対応ブラウザは画面全体をフェード、
 * 非対応ブラウザは一時クラスで色系プロパティに transition をかける
 */
function crossFade(update: () => void): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }

  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition) {
    doc.startViewTransition(update);
    return;
  }

  const root = document.documentElement;
  root.classList.add('theme-fade');
  update();
  window.setTimeout(() => root.classList.remove('theme-fade'), 550);
}

/** ユーザーが手動選択していない間だけ、システム設定の変更に追従する */
export function watchSystemTheme(): void {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
