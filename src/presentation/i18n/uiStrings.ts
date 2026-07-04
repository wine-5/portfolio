import type { Locale } from '@application/ports/Locale';

/** コンポーネント内に直書きしていた固定 UI 文言の翻訳辞書 */
interface UiStrings {
  readonly navGames: string;
  readonly navSkills: string;
  readonly navNews: string;
  readonly navAbout: string;
  readonly skillsTitle: string;
  readonly groupLanguages: string;
  readonly groupTools: string;
  readonly relatedWorks: string;
  readonly gamesTitle: string;
  readonly registered: string;
  readonly newsTitle: string;
  readonly aboutTitle: string;
  readonly steamPage: string;
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
  readonly toLightMode: string;
  readonly toDarkMode: string;
}

const STRINGS: Record<Locale, UiStrings> = {
  ja: {
    navGames: 'GAMES',
    navSkills: 'SKILLS',
    navNews: 'NEWS',
    navAbout: 'ABOUT',
    skillsTitle: 'SKILLS',
    groupLanguages: 'LANGUAGES',
    groupTools: 'TOOLS & ENGINES',
    relatedWorks: '関連作品',
    gamesTitle: 'GAME ARCHIVE',
    registered: 'REGISTERED',
    newsTitle: 'NEWS',
    aboutTitle: 'ABOUT',
    steamPage: 'Steamページ',
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
    toLightMode: 'ライトモードに切り替え',
    toDarkMode: 'ダークモードに切り替え',
  },
  en: {
    navGames: 'GAMES',
    navSkills: 'SKILLS',
    navNews: 'NEWS',
    navAbout: 'ABOUT',
    skillsTitle: 'SKILLS',
    groupLanguages: 'LANGUAGES',
    groupTools: 'TOOLS & ENGINES',
    relatedWorks: 'Related Works',
    gamesTitle: 'GAME ARCHIVE',
    registered: 'REGISTERED',
    newsTitle: 'NEWS',
    aboutTitle: 'ABOUT',
    steamPage: 'Steam Page',
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
    toLightMode: 'Switch to light mode',
    toDarkMode: 'Switch to dark mode',
  },
  zh: {
    navGames: '游戏介绍',
    navSkills: '技能',
    navNews: '新闻',
    navAbout: '自我介绍',
    skillsTitle: '技能',
    groupLanguages: '编程语言',
    groupTools: '工具与引擎',
    relatedWorks: '相关作品',
    gamesTitle: '游戏介绍',
    registered: '收录作品数',
    newsTitle: '新闻',
    aboutTitle: '自我介绍',
    steamPage: 'Steam页面',
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
    toLightMode: '切换到浅色模式',
    toDarkMode: '切换到深色模式',
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

/** 経験月数を「2年3ヶ月」等のロケール別表記にする */
export function formatExperience(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  switch (current) {
    case 'ja':
      return `${years > 0 ? `${years}年` : ''}${months > 0 || years === 0 ? `${months}ヶ月` : ''}`;
    case 'zh':
      return `${years > 0 ? `${years}年` : ''}${months > 0 || years === 0 ? `${months}个月` : ''}`;
    case 'en':
      return `${years > 0 ? `${years}y ` : ''}${months > 0 || years === 0 ? `${months}m` : ''}`.trim();
  }
}
