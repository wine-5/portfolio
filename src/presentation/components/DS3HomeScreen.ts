import { Component } from '../core/Component';
import { GamesSection } from './sections/GamesSection';
import { AboutSection } from './sections/AboutSection';
import { SkillsSection } from './sections/SkillsSection';
import { ContactSection } from './sections/ContactSection';

type SectionId = 'about' | 'games' | 'skills' | 'contact' | 'settings' | 'updates';

interface SectionDef {
  id: SectionId;
  emoji: string;
  label: string;
  topLabel: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'about', emoji: '👤', label: 'About', topLabel: 'ABOUT' },
  { id: 'games', emoji: '🎮', label: 'Games', topLabel: 'GAMES' },
  { id: 'skills', emoji: '⚡', label: 'Skills', topLabel: 'SKILLS' },
  { id: 'contact', emoji: '✉️', label: 'Contact', topLabel: 'CONTACT' },
  { id: 'updates', emoji: '📖', label: 'Updates', topLabel: 'UPDATES' },
  { id: 'settings', emoji: '⚙️', label: 'Settings', topLabel: 'SETTINGS' },
];

/**
 * 3DSホーム画面風レイアウト（アプリ本体シェル）。
 * 物理的な3DS本体デザイン + 上画面(コンテンツ) + 下画面(ナビ) + コントローラー表現。
 */
export class DS3HomeScreen extends Component {
  private currentSection: SectionId = 'about';
  private sectionElements: Partial<Record<SectionId, HTMLElement>> = {};

  /**
   * 各セクションを事前にロード・描画してキャッシュ。
   */
  async initialize(): Promise<void> {
    const games = new GamesSection();
    await games.initialize();
    this.sectionElements.games = games.render();

    const about = new AboutSection();
    await about.initialize();
    this.sectionElements.about = about.render();

    const skills = new SkillsSection();
    await skills.initialize();
    this.sectionElements.skills = skills.render();

    const contact = new ContactSection();
    this.sectionElements.contact = contact.render();

    this.sectionElements.updates = this.buildPlaceholder('📖 冒険の書', '近日公開予定 — 制作の歩みを記録した更新ログ');
    this.sectionElements.settings = this.buildSettings();
  }

  render(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'ds3-wrap';

    const dsTotal = document.createElement('div');
    dsTotal.className = 'ds3-total';

    dsTotal.appendChild(this.buildTopBody());
    dsTotal.appendChild(this.buildHinge());
    dsTotal.appendChild(this.buildBottomBody());

    wrap.appendChild(dsTotal);
    return wrap;
  }

  // ===== TOP BODY =====
  private buildTopBody(): HTMLElement {
    const bodyTop = document.createElement('div');
    bodyTop.className = 'ds3-body-top';

    const shoulders = document.createElement('div');
    shoulders.className = 'ds3-shoulders';
    shoulders.innerHTML = `
      <div class="ds3-shoulder ds3-shoulder-l"><span>L</span></div>
      <div class="ds3-shoulder ds3-shoulder-r"><span>R</span></div>
    `;
    bodyTop.appendChild(shoulders);

    const topScreenSection = document.createElement('div');
    topScreenSection.className = 'ds3-top-screen-section';
    topScreenSection.innerHTML = `
      <div class="ds3-top-spk-l">${this.spkDots()}</div>
      <div class="ds3-top-spk-r">${this.spkDots()}</div>
      <div class="ds3-camera-dot"></div>
    `;

    const topBezel = document.createElement('div');
    topBezel.className = 'ds3-top-bezel';

    const topScreen = document.createElement('div');
    topScreen.className = 'ds3-top-screen';

    // ステータスバー
    const topBar = document.createElement('div');
    topBar.className = 'ds3-top-bar';
    topBar.innerHTML = `
      <div class="ds3-dot-grn"></div>
      <span id="ds3-top-label">PORTFOLIO — ABOUT</span>
      <span class="ds3-top-clock" id="ds3-top-clock"></span>
    `;
    topScreen.appendChild(topBar);

    // コンテンツビューポート（スクロール可能）
    const viewport = document.createElement('div');
    viewport.className = 'ds3-top-viewport';
    viewport.id = 'ds3-top-viewport';

    SECTIONS.forEach((s) => {
      const el = this.sectionElements[s.id];
      if (!el) return;
      const pane = document.createElement('div');
      pane.className = 'ds3-pane';
      pane.dataset.section = s.id;
      pane.style.display = s.id === this.currentSection ? 'block' : 'none';
      pane.appendChild(el);
      viewport.appendChild(pane);
    });

    topScreen.appendChild(viewport);

    const ind3d = document.createElement('div');
    ind3d.className = 'ds3-ind3d';
    ind3d.textContent = '3D';
    topScreen.appendChild(ind3d);

    topBezel.appendChild(topScreen);
    topScreenSection.appendChild(topBezel);
    bodyTop.appendChild(topScreenSection);

    return bodyTop;
  }

  // ===== HINGE =====
  private buildHinge(): HTMLElement {
    const hinge = document.createElement('div');
    hinge.className = 'ds3-hinge';
    hinge.innerHTML = `
      <div class="ds3-hinge-nub"></div>
      <div class="ds3-hinge-nub"></div>
    `;
    return hinge;
  }

  // ===== BOTTOM BODY =====
  private buildBottomBody(): HTMLElement {
    const bodyBottom = document.createElement('div');
    bodyBottom.className = 'ds3-body-bottom';

    const bottomMain = document.createElement('div');
    bottomMain.className = 'ds3-bottom-main';

    // 左コントローラー
    const leftCtrl = document.createElement('div');
    leftCtrl.className = 'ds3-left-ctrl';
    leftCtrl.innerHTML = `
      <div class="ds3-slide-pad"><div class="ds3-slide-pad-inner"></div></div>
      <div class="ds3-dpad">
        <div class="ds3-dpad-h"></div>
        <div class="ds3-dpad-v"></div>
        <div class="ds3-dpad-c"></div>
      </div>
    `;
    bottomMain.appendChild(leftCtrl);

    // 下画面
    const bottomScreenWrap = document.createElement('div');
    bottomScreenWrap.className = 'ds3-bottom-screen-wrap';

    const bottomBezel = document.createElement('div');
    bottomBezel.className = 'ds3-bottom-bezel';

    const bottomScreen = document.createElement('div');
    bottomScreen.className = 'ds3-bottom-screen';

    // ナビゲーションタブ
    const botNav = document.createElement('div');
    botNav.className = 'ds3-bot-nav';
    botNav.id = 'ds3-bot-nav';
    SECTIONS.slice(0, 4).forEach((s) => {
      const btn = document.createElement('button');
      btn.className = 'ds3-bot-btn';
      if (s.id === this.currentSection) btn.classList.add('ds3-bot-btn-act');
      btn.dataset.section = s.id;
      btn.textContent = s.label;
      btn.addEventListener('click', () => this.selectSection(s.id));
      botNav.appendChild(btn);
    });
    bottomScreen.appendChild(botNav);

    // アイコングリッド（3×3）
    const botIcons = document.createElement('div');
    botIcons.className = 'ds3-bot-icons';
    botIcons.id = 'ds3-bot-icons';

    SECTIONS.forEach((s) => {
      const iconEl = document.createElement('div');
      iconEl.className = 'ds3-bot-icon';
      if (s.id === this.currentSection) iconEl.classList.add('ds3-bot-icon-sel');
      iconEl.dataset.section = s.id;
      iconEl.innerHTML = `
        <div class="ds3-bot-icon-em">${s.emoji}</div>
        <div class="ds3-bot-icon-lb">${s.label}</div>
      `;
      iconEl.addEventListener('click', () => this.selectSection(s.id));
      botIcons.appendChild(iconEl);
    });

    // 空のアイコン（3×3グリッドの残り）
    for (let i = 0; i < 3; i++) {
      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'ds3-bot-icon ds3-bot-icon-empty';
      botIcons.appendChild(emptyIcon);
    }

    bottomScreen.appendChild(botIcons);
    bottomBezel.appendChild(bottomScreen);

    // SELECT HOME START
    const shsRow = document.createElement('div');
    shsRow.className = 'ds3-shs-row';
    shsRow.innerHTML = `
      <div class="ds3-shs-btn"><span>SEL</span></div>
      <div class="ds3-home-btn"><div class="ds3-home-inner"></div></div>
      <div class="ds3-shs-btn"><span>STA</span></div>
    `;

    bottomScreenWrap.appendChild(bottomBezel);
    bottomScreenWrap.appendChild(shsRow);
    bottomMain.appendChild(bottomScreenWrap);

    // 右コントローラー
    const rightCtrl = document.createElement('div');
    rightCtrl.className = 'ds3-right-ctrl';
    rightCtrl.innerHTML = `
      <div class="ds3-abxy">
        <div class="ds3-ab-btn ds3-btn-x">X</div>
        <div class="ds3-ab-btn ds3-btn-y">Y</div>
        <div class="ds3-ab-btn ds3-btn-a">A</div>
        <div class="ds3-ab-btn ds3-btn-b">B</div>
      </div>
      <div class="ds3-slide-pad-r"><div class="ds3-slide-pad-r-inner"></div></div>
    `;
    bottomMain.appendChild(rightCtrl);

    bodyBottom.appendChild(bottomMain);
    return bodyBottom;
  }

  /**
   * セクション選択 → 上画面のコンテンツを切り替え。
   */
  private selectSection(sectionId: SectionId): void {
    this.currentSection = sectionId;

    // 上画面ペインの表示切り替え
    const viewport = document.getElementById('ds3-top-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
      viewport.querySelectorAll<HTMLElement>('.ds3-pane').forEach((pane) => {
        pane.style.display = pane.dataset.section === sectionId ? 'block' : 'none';
      });
    }

    // 上画面ラベル更新
    const def = SECTIONS.find((s) => s.id === sectionId);
    const label = document.getElementById('ds3-top-label');
    if (label && def) label.textContent = `PORTFOLIO — ${def.topLabel}`;

    // ナビゲーションボタン
    document.querySelectorAll<HTMLElement>('#ds3-bot-nav .ds3-bot-btn').forEach((btn) => {
      btn.classList.toggle('ds3-bot-btn-act', btn.dataset.section === sectionId);
    });

    // アイコン
    document.querySelectorAll<HTMLElement>('#ds3-bot-icons .ds3-bot-icon').forEach((icon) => {
      icon.classList.toggle('ds3-bot-icon-sel', icon.dataset.section === sectionId);
    });
  }

  override onMounted(): void {
    this.startClock();
  }

  private startClock(): void {
    const update = () => {
      const clock = document.getElementById('ds3-top-clock');
      if (!clock) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      clock.textContent = `${hh}:${mm}`;
    };
    update();
    setInterval(update, 30000);
  }

  // ===== ヘルパー =====
  private spkDots(): string {
    return Array.from({ length: 9 }, () => '<div class="ds3-spk-dot"></div>').join('');
  }

  private buildPlaceholder(title: string, message: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-placeholder';
    el.innerHTML = `
      <h2 class="ds3-placeholder__title">${title}</h2>
      <p class="ds3-placeholder__msg">${message}</p>
    `;
    return el;
  }

  private buildSettings(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-settings';
    el.innerHTML = `
      <h2 class="ds3-settings__title">⚙️ SETTINGS</h2>
      <div class="ds3-settings__row">
        <span>テーマ</span>
        <button class="ds3-settings__btn" id="ds3-theme-btn">夜 / 昼</button>
      </div>
      <div class="ds3-settings__row">
        <span>言語 / Language</span>
        <button class="ds3-settings__btn" id="ds3-lang-btn">日本語 / EN</button>
      </div>
    `;
    return el;
  }
}

/**
 * DS3HomeScreen CSS。
 */
export const DS3_HOME_SCREEN_STYLES = `
/* ===== MAIN WRAPPER ===== */
.ds3-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-family: var(--font-pixel);
  height: 100vh;
  overflow: hidden;
}

.ds3-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-height: 100%;
  --ds3-top-w: 720px;
  --ds3-bottom-w: 820px;
}

/* ===== TOP BODY ===== */
.ds3-body-top {
  width: var(--ds3-top-w);
  max-width: 92vw;
  background: #1c1c1c;
  border-radius: 18px 18px 0 0;
  position: relative;
}

.ds3-shoulders {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0; left: -6px; right: -6px;
}

.ds3-shoulder {
  width: 120px; height: 15px;
  background: #2a2a2a;
  border: 1px solid #111;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #555;
}

.ds3-shoulder-l { border-radius: 10px 0 0 0; }
.ds3-shoulder-r { border-radius: 0 10px 0 0; }

.ds3-top-screen-section {
  padding: 16px 40px 10px;
  position: relative;
}

.ds3-top-spk-l, .ds3-top-spk-r {
  position: absolute;
  top: 30px;
  display: grid;
  grid-template-columns: repeat(3, 4px);
  gap: 3px;
}

.ds3-top-spk-l { left: 14px; }
.ds3-top-spk-r { right: 14px; }
.ds3-spk-dot { width: 3px; height: 3px; border-radius: 50%; background: #333; }

.ds3-camera-dot {
  width: 6px; height: 6px;
  background: #2a2a2a; border-radius: 50%;
  border: 1px solid #333;
  margin: 0 auto 6px;
}

.ds3-top-bezel {
  background: #111;
  border-radius: 6px;
  padding: 6px;
  border: 1.5px solid #000;
}

.ds3-top-screen {
  background: var(--bg-0, #0a1020);
  border-radius: 3px;
  height: clamp(200px, 48vh, 460px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.ds3-top-bar {
  background: #0d1a3a;
  border-bottom: 1px solid rgba(100, 150, 255, 0.2);
  padding: 6px 12px;
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: rgba(160, 200, 255, 0.75);
  flex-shrink: 0;
}

.ds3-dot-grn { width: 6px; height: 6px; border-radius: 50%; background: rgba(80, 200, 80, 0.8); }
.ds3-top-clock { margin-left: auto; color: rgba(100, 160, 255, 0.5); }

.ds3-top-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
}

.ds3-top-viewport::-webkit-scrollbar { width: 8px; }
.ds3-top-viewport::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
.ds3-top-viewport::-webkit-scrollbar-thumb { background: rgba(100,160,255,0.4); border-radius: 4px; }

/* セクションを上画面サイズに最適化 */
.ds3-pane .section {
  padding-block: 0 !important;
  margin-bottom: 0 !important;
}

.ds3-ind3d {
  position: absolute; bottom: 8px; right: 10px;
  font-size: 9px; color: #44cc44;
  pointer-events: none;
}

/* プレースホルダ / 設定 */
.ds3-placeholder, .ds3-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.ds3-placeholder__title, .ds3-settings__title {
  font-family: var(--font-pixel);
  color: var(--accent);
  font-size: var(--fs-xl);
}

.ds3-placeholder__msg { color: var(--ink-dim); }

.ds3-settings { align-items: stretch; }
.ds3-settings__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  border: 2px solid var(--line);
  background: var(--bg-window);
  color: var(--ink);
}

.ds3-settings__btn {
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--accent);
  background: var(--bg-1);
  color: var(--accent);
  font-family: var(--font-pixel);
  cursor: pointer;
}

.ds3-settings__btn:hover { background: var(--accent); color: var(--bg-primary); }

/* ===== HINGE ===== */
.ds3-hinge {
  width: var(--ds3-top-w);
  max-width: 92vw;
  background: #111;
  height: 15px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}

.ds3-hinge-nub {
  width: 40px; height: 11px;
  background: #0a0a0a; border-radius: 6px; border: 1px solid #222;
}

/* ===== BOTTOM BODY ===== */
.ds3-body-bottom {
  width: var(--ds3-bottom-w);
  max-width: 96vw;
  background: #1e1e1e;
  border-radius: 0 0 40px 40px;
  padding: 12px 0 20px;
  position: relative;
}

.ds3-bottom-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 0 20px;
}

/* 左コントローラー */
.ds3-left-ctrl, .ds3-right-ctrl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.ds3-slide-pad {
  width: 46px; height: 46px;
  background: #2d2d2d; border-radius: 50%;
  border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-slide-pad-inner {
  width: 24px; height: 24px;
  background: #3a3a3a; border-radius: 50%; border: 1px solid #222;
}

.ds3-dpad { position: relative; width: 60px; height: 60px; }
.ds3-dpad-h {
  position: absolute; width: 100%; height: 33%;
  top: 33%; left: 0;
  background: #252525; border-radius: 4px; border: 1px solid #111;
}
.ds3-dpad-v {
  position: absolute; width: 33%; height: 100%;
  top: 0; left: 33%;
  background: #252525; border-radius: 4px; border: 1px solid #111;
}
.ds3-dpad-c {
  position: absolute; width: 33%; height: 33%;
  top: 33%; left: 33%;
  background: #1c1c1c; z-index: 2;
}

/* 下画面 */
.ds3-bottom-screen-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ds3-bottom-bezel {
  background: #111;
  border-radius: 6px;
  padding: 6px;
  border: 1.5px solid #000;
  width: 420px;
  max-width: 70vw;
}

.ds3-bottom-screen {
  background: #0a1020;
  border-radius: 3px;
  height: clamp(170px, 30vh, 300px);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.ds3-bot-nav {
  background: rgba(10, 25, 60, 0.95);
  border-bottom: 1px solid rgba(100, 160, 255, 0.15);
  display: flex; align-items: center;
  padding: 6px; gap: 5px;
}

.ds3-bot-btn {
  background: rgba(20, 50, 110, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.2);
  border-radius: 4px;
  color: rgba(150, 200, 255, 0.9);
  font-size: 10px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 100ms;
  flex: 1;
}

.ds3-bot-btn:hover { background: rgba(40, 80, 150, 0.7); }

.ds3-bot-btn-act {
  background: rgba(50, 110, 220, 0.7);
  border-color: rgba(100, 180, 255, 0.5);
  color: #fff;
}

.ds3-bot-icons {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px; padding: 10px;
}

.ds3-bot-icon {
  background: rgba(0, 25, 65, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.12);
  border-radius: 8px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px; padding: 6px;
  cursor: pointer;
  transition: all 120ms;
}

.ds3-bot-icon:hover {
  background: rgba(20, 50, 120, 0.5);
  border-color: rgba(100, 160, 255, 0.3);
  transform: translateY(-2px);
}

.ds3-bot-icon-sel {
  background: rgba(35, 80, 190, 0.55);
  border-color: rgba(100, 180, 255, 0.5);
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.4);
}

.ds3-bot-icon-empty {
  background: rgba(0, 15, 40, 0.3);
  border-style: dashed;
  cursor: default;
}
.ds3-bot-icon-empty:hover { transform: none; background: rgba(0, 15, 40, 0.3); border-color: rgba(100,160,255,0.12); }

.ds3-bot-icon-em { font-size: 24px; }
.ds3-bot-icon-lb { color: rgba(150, 200, 255, 0.85); font-size: 9px; text-align: center; }

.ds3-shs-row { display: flex; align-items: center; gap: 12px; }

.ds3-shs-btn {
  width: 36px; height: 11px;
  background: #2a2a2a; border-radius: 6px; border: 1px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-shs-btn span { color: #555; font-size: 6px; }

.ds3-home-btn {
  width: 28px; height: 28px;
  background: #2a2a2a; border-radius: 50%; border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-home-inner { width: 12px; height: 12px; background: #3a3a3a; border-radius: 50%; border: 1px solid #222; }

/* 右コントローラー */
.ds3-abxy { position: relative; width: 70px; height: 70px; }

.ds3-ab-btn {
  position: absolute;
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.ds3-btn-x { background: #4488cc; top: 0; left: 23px; }
.ds3-btn-y { background: #44aa55; top: 23px; left: 0; }
.ds3-btn-a { background: #cc4444; top: 23px; right: 0; }
.ds3-btn-b { background: #ccaa22; bottom: 0; left: 23px; }

.ds3-slide-pad-r {
  width: 38px; height: 38px;
  background: #2d2d2d; border-radius: 50%;
  border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-slide-pad-r-inner {
  width: 18px; height: 18px;
  background: #3a3a3a; border-radius: 50%; border: 1px solid #222;
}

/* ===== レスポンシブ ===== */
@media (max-width: 900px) {
  .ds3-left-ctrl, .ds3-right-ctrl { display: none; }
  .ds3-bottom-bezel { width: 90%; max-width: none; }
  .ds3-total { --ds3-bottom-w: var(--ds3-top-w); }
}

@media (max-width: 640px) {
  .ds3-top-screen { height: clamp(180px, 42vh, 360px); }
  .ds3-bottom-screen { height: clamp(150px, 28vh, 260px); }
  .ds3-bot-icon-em { font-size: 20px; }
}
`;
