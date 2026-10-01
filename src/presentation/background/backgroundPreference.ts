export const BACKGROUNDS = ['depth', 'classic'] as const;
/** depth = Three.js の奥行き背景 / classic = 従来の 2D Canvas 背景 */
export type BackgroundKind = (typeof BACKGROUNDS)[number];

const STORAGE_KEY = 'background';

const DEFAULT_BACKGROUND: BackgroundKind = 'depth';

function isBackground(value: string): value is BackgroundKind {
  return (BACKGROUNDS as readonly string[]).includes(value);
}

/** 背景の種類を検出する。優先順位: localStorage(手動選択) > デフォルト(depth) */
export function detectBackground(): BackgroundKind {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isBackground(stored)) return stored;
  } catch {
    // ストレージが使えない環境ではデフォルトのまま
  }
  return DEFAULT_BACKGROUND;
}

export function persistBackground(kind: BackgroundKind): void {
  try {
    localStorage.setItem(STORAGE_KEY, kind);
  } catch {
    // 保存できなくても今回の表示には反映済みなので無視する
  }
}
