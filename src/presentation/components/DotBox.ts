/**
 * ドット枠コンポーネント。
 * RPG的な矩形枠を作成。
 */
export function createDotBox(content: HTMLElement | string, options?: { padding?: string; class?: string }): HTMLElement {
  const box = document.createElement('div');
  box.className = `dot-box ${options?.class ?? ''}`;
  if (options?.padding) {
    box.style.padding = options.padding;
  }

  if (typeof content === 'string') {
    box.innerHTML = content;
  } else {
    box.appendChild(content);
  }

  return box;
}

/**
 * CSSクラス: dot-box
 */
export const DOT_BOX_STYLES = `
.dot-box {
  border: var(--border-pixel) solid var(--line);
  background: var(--bg-window);
  padding: var(--space-4);
  box-shadow: var(--window-shadow);
  position: relative;
}

.dot-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border: var(--px) solid var(--line-soft);
  pointer-events: none;
  top: var(--px);
  left: var(--px);
  right: var(--px);
  bottom: var(--px);
}
`;
