/** テンプレート文字列に流し込むデータのエスケープ */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import type { Store } from '@domain/entities/Game';

/** 配信ストアのバッジ(App Store / Steam のブランド風カラー) */
export function storeChip(store: Store): string {
  return store === 'app-store'
    ? '<span class="store-chip store-chip--app">App Store</span>'
    : '<span class="store-chip store-chip--steam">STEAM</span>';
}

/** リンク先 URL からブランドアイコン(Font Awesome)を推定して返す。該当なしは空文字 */
export function linkIcon(url: string): string {
  const icon = url.includes('github.com')
    ? 'fa-brands fa-github'
    : url.includes('x.com') || url.includes('twitter.com')
      ? 'fa-brands fa-x-twitter'
      : url.includes('steampowered.com')
        ? 'fa-brands fa-steam'
        : url.includes('apps.apple.com')
          ? 'fa-brands fa-apple'
          : url.includes('unityroom.com')
            ? 'fa-solid fa-gamepad'
            : '';
  return icon ? `<i class="${icon}" aria-hidden="true"></i> ` : '';
}

/** ルート相対のアセットパスに Vite の base を付与する */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
