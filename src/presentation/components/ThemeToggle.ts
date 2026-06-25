import { root } from '@app/composition-root';

/**
 * テーマ切替ボタン: 昼(day) / 夜(night) を切り替え。
 */
export class ThemeToggle {
  private currentTheme: 'day' | 'night' = 'night';

  async initialize(): Promise<void> {
    this.currentTheme = await root.getPreferenceStore().getTheme();
  }

  render(): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.title = 'テーマを切り替え (昼/夜)';
    btn.textContent = this.currentTheme === 'night' ? '☀️' : '🌙';

    btn.addEventListener('click', async () => {
      const newTheme = this.currentTheme === 'night' ? 'day' : 'night';
      await root.getPreferenceStore().setTheme(newTheme);
      this.currentTheme = newTheme;
      btn.textContent = newTheme === 'night' ? '☀️' : '🌙';
    });

    return btn;
  }
}

/**
 * ThemeToggle CSS。
 */
export const THEME_TOGGLE_STYLES = `
.theme-toggle {
  background: none;
  border: none;
  color: var(--ink);
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--space-1);
  transition: transform 150ms;
}

.theme-toggle:hover {
  transform: scale(1.2);
}

.theme-toggle:focus-visible {
  outline: 1px solid var(--accent);
  border-radius: 2px;
}
`;
