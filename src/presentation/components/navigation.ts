import { t } from '../i18n/uiStrings';

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Header/Footer 共通のナビゲーション定義。セクション追加時はここに足す */
export function navItems(): readonly NavItem[] {
  // 並びは面接官に見せたい優先順(Games → Skills → About → News)
  return [
    { label: t('navGames'), href: '#games' },
    { label: t('navSkills'), href: '#skills' },
    { label: t('navAbout'), href: '#about' },
    { label: t('navNews'), href: '#news' },
  ];
}
