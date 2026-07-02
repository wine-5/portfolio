export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Header/Footer 共通のナビゲーション定義。セクション追加時はここに足す */
export function navItems(): readonly NavItem[] {
  return [
    { label: 'GAMES', href: '#games' },
    { label: 'NEWS', href: '#news' },
    { label: 'ABOUT', href: '#about' },
  ];
}
