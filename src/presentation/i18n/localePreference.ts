import { isLocale, type Locale } from '@application/ports/Locale';

/** 旧サイト(JS 版)と同じキーを使い、言語設定を引き継げるようにする */
const STORAGE_KEY = 'language';

const DEFAULT_LOCALE: Locale = 'ja';

/**
 * 表示言語を検出する。
 * 優先順位: URL パラメータ > localStorage > ブラウザ設定 > デフォルト(ja)
 */
export function detectLocale(): Locale {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && isLocale(urlLang)) return urlLang;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;

  const browserLang = navigator.language.split('-')[0] ?? '';
  if (isLocale(browserLang)) return browserLang;

  return DEFAULT_LOCALE;
}

/** 選んだ言語を次回訪問時にも使えるよう保存する */
export function persistLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}
