import type { Locale } from '@application/ports/Locale';

/** コンポーネント内に直書きしていた固定 UI 文言の翻訳辞書 */
interface UiStrings {
  readonly menu: string;
  readonly details: string;
  readonly viewDetails: string;
  readonly overview: string;
  readonly responsibilities: string;
  readonly close: string;
  readonly privacyPolicy: string;
  readonly categoryFilter: string;
  readonly languageFilter: string;
  readonly switchLanguage: string;
}

const STRINGS: Record<Locale, UiStrings> = {
  ja: {
    menu: 'メニュー',
    details: '詳細',
    viewDetails: '詳細を見る',
    overview: '概要',
    responsibilities: '担当',
    close: '閉じる',
    privacyPolicy: 'プライバシーポリシー',
    categoryFilter: 'カテゴリ絞り込み',
    languageFilter: '言語で絞り込み',
    switchLanguage: '言語切り替え',
  },
  en: {
    menu: 'Menu',
    details: 'Details',
    viewDetails: 'View details',
    overview: 'Overview',
    responsibilities: 'My Role',
    close: 'Close',
    privacyPolicy: 'Privacy Policy',
    categoryFilter: 'Filter by category',
    languageFilter: 'Filter by language',
    switchLanguage: 'Switch language',
  },
  zh: {
    menu: '菜单',
    details: '详情',
    viewDetails: '查看详情',
    overview: '概述',
    responsibilities: '负责内容',
    close: '关闭',
    privacyPolicy: '隐私政策',
    categoryFilter: '按类别筛选',
    languageFilter: '按语言筛选',
    switchLanguage: '切换语言',
  },
};

/** 言語セレクタに表示する各言語の自称表記 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  zh: '中文',
};

let current: Locale = 'ja';

/** 描画前に App が現在のロケールを設定する */
export function setUiLocale(locale: Locale): void {
  current = locale;
}

/** 現在のロケールの UI 文言を返す */
export function t(key: keyof UiStrings): string {
  return STRINGS[current][key];
}
