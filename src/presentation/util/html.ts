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

/** ルート相対のアセットパスに Vite の base を付与する */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
