import { t } from '../i18n/uiStrings';

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Header/Footer 共通のナビゲーション定義。セクション追加時はここに足す */
export function navItems(): readonly NavItem[] {
  return [
    { label: t('navGames'), href: '#games' },
    { label: t('navNews'), href: '#news' },
    { label: t('navAbout'), href: '#about' },
  ];
}
