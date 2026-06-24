/**
 * EXPバーコンポーネント。
 */
export function createExpBar(percent: number, label?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'exp-bar-container';

  const bar = document.createElement('div');
  bar.className = 'exp-bar';
  const fill = document.createElement('div');
  fill.className = 'exp-bar-fill';
  fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  bar.appendChild(fill);

  container.appendChild(bar);
  if (label) {
    const text = document.createElement('span');
    text.className = 'exp-bar-label';
    text.textContent = label;
    container.appendChild(text);
  }

  return container;
}

/**
 * EXPバーCSS。
 */
export const EXP_BAR_STYLES = `
.exp-bar-container {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
}

.exp-bar {
  flex: 1;
  height: 12px;
  border: 2px solid var(--line);
  background: var(--bg-1);
  position: relative;
  min-width: 80px;
}

.exp-bar::before,
.exp-bar::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 1px solid var(--line-soft);
  pointer-events: none;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-exp) 0%, var(--c-gold) 100%);
  transition: width 300ms ease;
}

.exp-bar-label {
  min-width: 4ch;
  text-align: right;
}
`;
