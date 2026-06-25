import { Component } from '../core/Component';

/**
 * 3DSホーム画面風レイアウト。
 * 物理的な3DS本体デザイン + 上下画面 + コントローラー表現。
 */
export class DS3HomeScreen extends Component {

  render(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'ds3-wrap';

    const dsTotal = document.createElement('div');
    dsTotal.className = 'ds3-total';

    // ===== TOP BODY =====
    const bodyTop = document.createElement('div');
    bodyTop.className = 'ds3-body-top';

    // ショルダーボタン
    const shoulders = document.createElement('div');
    shoulders.className = 'ds3-shoulders';
    shoulders.innerHTML = `
      <div class="ds3-shoulder ds3-shoulder-l"><span>L</span></div>
      <div class="ds3-shoulder ds3-shoulder-r"><span>R</span></div>
    `;
    bodyTop.appendChild(shoulders);

    // スピーカー穴（装飾）
    const topScreenSection = document.createElement('div');
    topScreenSection.className = 'ds3-top-screen-section';
    topScreenSection.innerHTML = `
      <div class="ds3-top-spk-l">
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
      </div>
      <div class="ds3-top-spk-r">
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
        <div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div><div class="ds3-spk-dot"></div>
      </div>
    `;

    // カメラ（装飾）
    const cameraSection = document.createElement('div');
    cameraSection.innerHTML = '<div class="ds3-camera-dot"></div>';

    // 上画面
    const topBezel = document.createElement('div');
    topBezel.className = 'ds3-top-bezel';

    const topScreen = document.createElement('div');
    topScreen.className = 'ds3-top-screen';
    topScreen.id = 'ds3-top-screen';

    // ステータスバー
    const topBar = document.createElement('div');
    topBar.className = 'ds3-top-bar';
    topBar.innerHTML = `
      <div class="ds3-dot-grn"></div>
      <span>PORTFOLIO — ABOUT</span>
      <span style="margin-left:auto; color:rgba(100,160,255,0.4);">22:14</span>
    `;
    topScreen.appendChild(topBar);

    // コンテンツエリア
    const topBody = document.createElement('div');
    topBody.className = 'ds3-top-body';
    topBody.innerHTML = `
      <div class="ds3-screen-title">WINE-5</div>
      <div class="ds3-screen-div"></div>
      <div class="ds3-screen-sub">GAME DEVELOPER</div>
      <div class="ds3-screen-detail">
        <p>Select a section to view details<br><br>Games / About / Skills / Contact</p>
      </div>
    `;
    topScreen.appendChild(topBody);

    // 3D表示（装飾）
    const ind3d = document.createElement('div');
    ind3d.className = 'ds3-ind3d';
    ind3d.textContent = '3D';
    topScreen.appendChild(ind3d);

    topBezel.appendChild(topScreen);
    topScreenSection.appendChild(cameraSection);
    topScreenSection.appendChild(topBezel);
    bodyTop.appendChild(topScreenSection);

    dsTotal.appendChild(bodyTop);

    // ===== HINGE =====
    const hinge = document.createElement('div');
    hinge.className = 'ds3-hinge';
    hinge.innerHTML = `
      <div class="ds3-hinge-nub"></div>
      <div class="ds3-hinge-nub"></div>
    `;
    dsTotal.appendChild(hinge);

    // ===== BOTTOM BODY =====
    const bodyBottom = document.createElement('div');
    bodyBottom.className = 'ds3-body-bottom';

    const bottomMain = document.createElement('div');
    bottomMain.className = 'ds3-bottom-main';

    // 左コントローラー（装飾）
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
    botNav.innerHTML = `
      <button class="ds3-bot-btn ds3-bot-btn-act" data-section="about">About</button>
      <button class="ds3-bot-btn" data-section="games">Games</button>
      <button class="ds3-bot-btn" data-section="skills">Skills</button>
      <button class="ds3-bot-btn" data-section="contact">Contact</button>
      <button class="ds3-bot-btn ds3-bot-btn-back">← Back</button>
    `;
    bottomScreen.appendChild(botNav);

    // アイコングリッド（3×3）
    const botIcons = document.createElement('div');
    botIcons.className = 'ds3-bot-icons';
    botIcons.id = 'ds3-bot-icons';

    const icons = [
      { emoji: '👤', label: 'About', id: 'about' },
      { emoji: '🎮', label: 'Games', id: 'games' },
      { emoji: '⚡', label: 'Skills', id: 'skills' },
      { emoji: '✉️', label: 'Contact', id: 'contact' },
      { emoji: '⚙️', label: 'Settings', id: 'settings' },
      { emoji: '📖', label: 'Updates', id: 'updates' },
    ];

    icons.forEach((icon, idx) => {
      const iconEl = document.createElement('div');
      iconEl.className = 'ds3-bot-icon';
      if (idx === 0) iconEl.classList.add('ds3-bot-icon-sel');
      iconEl.dataset.section = icon.id;
      iconEl.innerHTML = `
        <div class="ds3-bot-icon-em">${icon.emoji}</div>
        <div class="ds3-bot-icon-lb">${icon.label}</div>
      `;
      iconEl.addEventListener('click', () => this.selectSection(icon.id, botNav, botIcons));
      botIcons.appendChild(iconEl);
    });

    // 空のアイコン（3個）
    for (let i = 0; i < 3; i++) {
      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'ds3-bot-icon';
      emptyIcon.innerHTML = `
        <div class="ds3-bot-icon-em">　</div>
        <div class="ds3-bot-icon-lb">　</div>
      `;
      botIcons.appendChild(emptyIcon);
    }

    bottomScreen.appendChild(botIcons);
    bottomBezel.appendChild(bottomScreen);

    // SELECT HOME START ボタン
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

    // 右コントローラー（装飾）
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
    dsTotal.appendChild(bodyBottom);

    wrap.appendChild(dsTotal);
    return wrap;
  }

  private selectSection(sectionId: string, navEl: HTMLElement, iconEl: HTMLElement): void {
    // ナビゲーションボタンの選択状態を更新
    navEl.querySelectorAll('.ds3-bot-btn:not(.ds3-bot-btn-back)').forEach((btn) => {
      const btn2 = btn as HTMLElement & { dataset: Record<string, string> };
      btn.classList.toggle('ds3-bot-btn-act', btn2.dataset.section === sectionId);
    });

    // アイコンの選択状態を更新
    iconEl.querySelectorAll('.ds3-bot-icon').forEach((icon) => {
      const icon2 = icon as HTMLElement & { dataset: Record<string, string> };
      icon.classList.toggle('ds3-bot-icon-sel', icon2.dataset.section === sectionId);
    });

    // TODO: セクションコンテンツを更新
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
  align-items: flex-start;
  padding: 2rem 0 3rem;
  font-family: var(--font-pixel);
  background: #0a0a0a;
  min-height: 100vh;
}

.ds3-total {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== TOP BODY ===== */
.ds3-body-top {
  width: 400px;
  background: #1c1c1c;
  border-radius: 14px 14px 0 0;
  position: relative;
}

.ds3-shoulders {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0; left: -6px; right: -6px;
}

.ds3-shoulder {
  width: 72px; height: 13px;
  background: #2a2a2a;
  border: 1px solid #111;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: #555;
}

.ds3-shoulder-l { border-radius: 8px 0 0 0; }
.ds3-shoulder-r { border-radius: 0 8px 0 0; }

/* スピーカー穴 */
.ds3-top-screen-section {
  padding: 16px 28px 10px;
  position: relative;
}

.ds3-top-spk-l, .ds3-top-spk-r {
  position: absolute;
  top: 22px;
  display: grid;
  grid-template-columns: repeat(3, 4px);
  gap: 3px;
}

.ds3-top-spk-l { left: 8px; }
.ds3-top-spk-r { right: 8px; }
.ds3-spk-dot { width: 3px; height: 3px; border-radius: 50%; background: #333; }

/* カメラ */
.ds3-camera-dot {
  width: 5px; height: 5px;
  background: #2a2a2a; border-radius: 50%;
  border: 1px solid #333;
  margin: 0 auto 4px;
}

/* 上画面 */
.ds3-top-bezel {
  background: #111;
  border-radius: 6px;
  padding: 5px 5px 3px;
  border: 1.5px solid #000;
}

.ds3-top-screen {
  background: #0a1020;
  border-radius: 3px;
  height: 218px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ds3-top-bar {
  background: #0d1a3a;
  border-bottom: 1px solid rgba(100, 150, 255, 0.2);
  padding: 4px 8px;
  display: flex; align-items: center; gap: 6px;
  font-size: 9px; color: rgba(160, 200, 255, 0.7);
}

.ds3-dot-grn { width: 5px; height: 5px; border-radius: 50%; background: rgba(80, 200, 80, 0.8); }

.ds3-top-body {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 12px;
}

.ds3-screen-title { color: rgba(190, 220, 255, 0.9); font-size: 15px; font-weight: 500; letter-spacing: 2px; }
.ds3-screen-div { width: 60px; height: 1px; background: rgba(100, 160, 255, 0.3); }
.ds3-screen-sub { color: rgba(100, 160, 255, 0.6); font-size: 9px; }

.ds3-screen-detail {
  background: rgba(0, 20, 60, 0.7);
  border: 1px solid rgba(100, 160, 255, 0.15);
  border-radius: 4px;
  width: 88%; padding: 8px 10px; text-align: center;
}

.ds3-screen-detail p {
  color: rgba(120, 180, 255, 0.65);
  font-size: 9px;
  margin: 0; line-height: 1.7;
}

.ds3-ind3d {
  position: absolute; bottom: 14px; right: 10px;
  font-size: 8px; color: #44cc44;
}

/* ===== HINGE ===== */
.ds3-hinge {
  width: 400px;
  background: #111;
  height: 13px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.ds3-hinge-nub {
  width: 28px; height: 9px;
  background: #0a0a0a; border-radius: 5px; border: 1px solid #222;
}

/* ===== BOTTOM BODY ===== */
.ds3-body-bottom {
  width: 460px;
  background: #1e1e1e;
  border-radius: 0 0 34px 34px;
  padding: 10px 0 24px;
  position: relative;
}

.ds3-bottom-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 14px;
}

/* 左コントローラー */
.ds3-left-ctrl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ds3-slide-pad {
  width: 32px; height: 32px;
  background: #2d2d2d; border-radius: 50%;
  border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-slide-pad-inner {
  width: 17px; height: 17px;
  background: #3a3a3a; border-radius: 50%; border: 1px solid #222;
}

.ds3-dpad { position: relative; width: 48px; height: 48px; }
.ds3-dpad-h {
  position: absolute; width: 100%; height: 33%;
  top: 33%; left: 0;
  background: #252525; border-radius: 3px; border: 1px solid #111;
}
.ds3-dpad-v {
  position: absolute; width: 33%; height: 100%;
  top: 0; left: 33%;
  background: #252525; border-radius: 3px; border: 1px solid #111;
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
  gap: 4px;
}

.ds3-bottom-bezel {
  background: #111;
  border-radius: 5px;
  padding: 5px;
  border: 1.5px solid #000;
  width: 230px;
}

.ds3-bottom-screen {
  background: #0a1020;
  border-radius: 3px;
  height: 155px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.ds3-bot-nav {
  background: rgba(10, 25, 60, 0.95);
  border-bottom: 1px solid rgba(100, 160, 255, 0.15);
  display: flex; align-items: center;
  padding: 4px 5px; gap: 3px;
}

.ds3-bot-btn {
  background: rgba(20, 50, 110, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.2);
  border-radius: 3px;
  color: rgba(150, 200, 255, 0.9);
  font-size: 7px;
  padding: 2px 5px;
  cursor: pointer;
  transition: all 100ms;
}

.ds3-bot-btn:hover {
  background: rgba(40, 80, 150, 0.7);
}

.ds3-bot-btn-act {
  background: rgba(50, 110, 220, 0.6);
  border-color: rgba(100, 180, 255, 0.45);
  color: rgba(220, 240, 255, 1);
}

.ds3-bot-btn-back {
  background: rgba(60, 20, 80, 0.5);
  border-color: rgba(180, 100, 255, 0.3);
  color: rgba(200, 150, 255, 0.9);
  margin-left: auto;
}

.ds3-bot-icons {
  flex: 1;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 4px; padding: 5px;
}

.ds3-bot-icon {
  background: rgba(0, 25, 65, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.1);
  border-radius: 5px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px; padding: 4px 2px;
  cursor: pointer;
  transition: all 100ms;
}

.ds3-bot-icon:hover {
  background: rgba(20, 50, 120, 0.5);
  border-color: rgba(100, 160, 255, 0.25);
}

.ds3-bot-icon-sel {
  background: rgba(35, 80, 190, 0.5);
  border-color: rgba(100, 180, 255, 0.35);
  box-shadow: 0 0 8px rgba(100, 160, 255, 0.3);
}

.ds3-bot-icon-em { font-size: 14px; }
.ds3-bot-icon-lb {
  color: rgba(120, 180, 255, 0.75);
  font-size: 6px; text-align: center;
}

.ds3-shs-row {
  display: flex; align-items: center; gap: 8px;
}

.ds3-shs-btn {
  width: 26px; height: 8px;
  background: #2a2a2a; border-radius: 4px; border: 1px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-shs-btn span { color: #555; font-size: 5px; }

.ds3-home-btn {
  width: 22px; height: 22px;
  background: #2a2a2a; border-radius: 50%; border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-home-inner { width: 9px; height: 9px; background: #3a3a3a; border-radius: 50%; border: 1px solid #222; }

/* 右コントローラー */
.ds3-right-ctrl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ds3-abxy { position: relative; width: 54px; height: 54px; }

.ds3-ab-btn {
  position: absolute;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.ds3-btn-x { background: #4488cc; top: 0; left: 18px; }
.ds3-btn-y { background: #44aa55; top: 18px; left: 0; }
.ds3-btn-a { background: #cc4444; top: 18px; right: 0; }
.ds3-btn-b { background: #ccaa22; bottom: 0; left: 18px; }

.ds3-slide-pad-r {
  width: 26px; height: 26px;
  background: #2d2d2d; border-radius: 50%;
  border: 2px solid #111;
  display: flex; align-items: center; justify-content: center;
}

.ds3-slide-pad-r-inner {
  width: 13px; height: 13px;
  background: #3a3a3a; border-radius: 50%; border: 1px solid #222;
}

@media (max-width: 768px) {
  .ds3-body-top, .ds3-hinge { width: 100%; max-width: 400px; }
  .ds3-body-bottom { width: 100%; max-width: 460px; }
}
`;
