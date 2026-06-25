import { ThemeToggle, THEME_TOGGLE_STYLES } from './ThemeToggle';
import { LanguageToggle, LANGUAGE_TOGGLE_STYLES } from './LanguageToggle';

/**
 * HUDナビゲーション: 上部バー、HP/MPステータス表示、テーマ・言語切替。
 */
export class HUDNav {
  async render(): Promise<HTMLElement> {
    const nav = document.createElement('nav');
    nav.className = 'hud-nav';

    // ロゴ・タイトル
    const brand = document.createElement('div');
    brand.className = 'hud-nav__brand';
    const title = document.createElement('h1');
    title.className = 'hud-nav__title';
    title.textContent = 'WINE-5';
    brand.appendChild(title);
    nav.appendChild(brand);

    // メニュー
    const menu = document.createElement('ul');
    menu.className = 'hud-nav__menu';
    const items = ['GAMES', 'ABOUT', 'SKILLS', 'CONTACT'];
    items.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'hud-nav__link';
      a.href = `#${item.toLowerCase()}`;
      a.textContent = item;
      li.appendChild(a);
      menu.appendChild(li);
    });
    nav.appendChild(menu);

    // ステータス + コントロール
    const rightArea = document.createElement('div');
    rightArea.className = 'hud-nav__right';

    // ステータス
    const status = document.createElement('div');
    status.className = 'hud-nav__status';
    status.innerHTML = `
      <span class="hud-nav__level">LV.5</span>
      <span class="hud-nav__stat">HP<span class="stat-bar">████░</span></span>
      <span class="hud-nav__stat">MP<span class="stat-bar">███░░</span></span>
    `;
    rightArea.appendChild(status);

    // テーマ・言語切替
    const controls = document.createElement('div');
    controls.className = 'hud-nav__controls';

    const themeToggle = new ThemeToggle();
    await themeToggle.initialize();
    controls.appendChild(themeToggle.render());

    const langToggle = new LanguageToggle();
    await langToggle.initialize();
    controls.appendChild(langToggle.render());

    rightArea.appendChild(controls);
    nav.appendChild(rightArea);

    return nav;
  }
}

/**
 * HUDNav CSS (含むテーマ・言語切替)。
 */
export const HUD_NAV_STYLES = `
${THEME_TOGGLE_STYLES}

${LANGUAGE_TOGGLE_STYLES}
.hud-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-hud);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: var(--hud-height);
  padding: 0 var(--container-pad);
  background: var(--bg-1);
  border-bottom: 2px solid var(--line);
  border-right: 2px solid var(--line);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
}

.hud-nav__brand {
  flex-shrink: 0;
}

.hud-nav__title {
  font-size: var(--fs-lg);
  color: var(--accent);
  margin: 0;
  letter-spacing: 0.1em;
}

.hud-nav__menu {
  display: flex;
  gap: var(--space-4);
  flex: 1;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.hud-nav__link {
  color: var(--ink);
  text-decoration: none;
  border: 1px solid transparent;
  padding: var(--space-1) var(--space-2);
  transition: all 150ms;
  cursor: pointer;
}

.hud-nav__link:hover,
.hud-nav__link:focus-visible {
  color: var(--select);
  border-bottom-color: var(--select);
}

.hud-nav__right {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-shrink: 0;
  border-left: 1px solid var(--line-soft);
  padding-left: var(--space-4);
}

.hud-nav__status {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  font-size: var(--fs-xs);
  color: var(--ink-dim);
}

.hud-nav__controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.hud-nav__level {
  color: var(--c-gold);
  font-weight: bold;
}

.hud-nav__stat {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-bar {
  display: inline-block;
  font-size: 0.8em;
}

@media (max-width: 640px) {
  .hud-nav {
    flex-wrap: wrap;
    height: auto;
    padding: var(--space-2) var(--container-pad);
  }

  .hud-nav__menu {
    order: 3;
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .hud-nav__status {
    border-left: none;
    border-top: 1px solid var(--line-soft);
    padding-left: 0;
    padding-top: var(--space-2);
    width: 100%;
  }
}
`;
