/** テンプレート文字列に流し込むデータのエスケープ */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import type { Store } from '@domain/entities/Game';

/**
 * images/icons/*.webp を 1em 角のアイコンとして埋め込む。
 * 単色のロゴ(GitHub / Steam / Unity / X)は背景の明暗で見えなくなるため、
 * 画像をマスクにして文字色(currentColor)で塗る。それ以外はそのまま画像で出す。
 */
const MONO_ICONS = new Set(['github', 'steam', 'unity', 'x']);

export function icon(name: string, extraClass = ''): string {
  const url = asset(`images/icons/${name}.webp`);
  const cls = `icon${extraClass ? ` ${extraClass}` : ''}`;
  return MONO_ICONS.has(name)
    ? `<span class="${cls} icon--mono" style="--icon-url: url('${esc(url)}')" aria-hidden="true"></span>`
    : `<img class="${cls}" src="${esc(url)}" alt="" aria-hidden="true" loading="lazy" />`;
}

/** 配信ストアのバッジ(App Store / Steam のブランド風カラー) */
export function storeChip(store: Store): string {
  return store === 'app-store'
    ? `<span class="store-chip store-chip--app">${icon('app-store')}App Store</span>`
    : `<span class="store-chip store-chip--steam">${icon('steam')}STEAM</span>`;
}

/** リンク先 URL からブランドアイコンを推定して返す。該当なしは空文字 */
export function linkIcon(url: string): string {
  if (url.includes('github.com')) return `${icon('github')} `;
  if (url.includes('steampowered.com')) return `${icon('steam')} `;
  if (url.includes('apps.apple.com')) return `${icon('app-store')} `;
  if (url.includes('unityroom.com')) return `${icon('unityroom')} `;
  if (url.includes('x.com') || url.includes('twitter.com')) return `${icon('x')} `;
  return '';
}

/** スキル名 → アイコンのファイル名。素材があるものだけ載せる */
const SKILL_ICONS: Readonly<Record<string, string>> = {
  'C#': 'csharp',
  'C++': 'cpp',
  Unity: 'unity',
  DxLib: 'dxlib',
  'Visual Studio': 'visual-studio',
  'Visual Studio Code': 'vscode',
  Git: 'git',
  'GitHub Actions': 'github',
  Blender: 'blender',
};

/** スキルカードの見出しアイコン。素材がないスキルは頭文字のタイルで代用する */
export function skillIcon(name: string): string {
  const file = SKILL_ICONS[name];
  return file
    ? `<span class="skill-icon">${icon(file)}</span>`
    : `<span class="skill-icon skill-icon--text" aria-hidden="true">${esc(name.slice(0, 2))}</span>`;
}

/** ルート相対のアセットパスに Vite の base を付与する */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
