import { asset } from '../util/html';

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** 別タブで開く外部/別ページリンク */
  readonly external?: boolean;
}

/** Header/Footer 共通のナビゲーション定義。セクション追加時はここに足す */
export function navItems(): readonly NavItem[] {
  return [
    { label: 'GAMES', href: '#games' },
    { label: 'ABOUT', href: '#about' },
    { label: 'UPDATES', href: asset('pages/history/history.html') },
  ];
}
