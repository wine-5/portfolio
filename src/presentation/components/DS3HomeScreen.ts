import { Component } from '../core/Component';
import { root } from '@app/composition-root';
import { createExpBar } from './ExpBar';
import type { ProfileVM, SkillVM, CodexEntryVM, GameDetailVM } from '@application/index';

type ViewId = 'home' | 'about' | 'games' | 'skills' | 'contact' | 'settings' | 'updates';

interface SectionDef {
  id: ViewId;
  emoji: string;
  label: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'about', emoji: '👤', label: 'About' },
  { id: 'games', emoji: '🎮', label: 'Games' },
  { id: 'skills', emoji: '⚡', label: 'Skills' },
  { id: 'contact', emoji: '✉️', label: 'Contact' },
  { id: 'updates', emoji: '📖', label: 'Updates' },
  { id: 'settings', emoji: '⚙️', label: 'Settings' },
];

/**
 * 3DSホーム画面風レイアウト（アプリ本体シェル）。
 * 「下画面=操作 / 上画面=表示」のドリルダウン式ナビゲーション。
 * 上画面は固定表示（スクロールなし）、下画面はビューごとに中身が丸ごと変わる。
 */
export class DS3HomeScreen extends Component {
  private profile!: ProfileVM;
  private skills: SkillVM[] = [];
  private codexEntries: CodexEntryVM[] = [];
  private gameDetails = new Map<string, GameDetailVM>();

  private topContent: HTMLElement | null = null;
  private bottomContent: HTMLElement | null = null;
  private topLabel: HTMLElement | null = null;

  private currentSection: ViewId = 'home';
  private previousSection: ViewId = 'home';

  // キーボード操作用
  private currentFocusIndex = 0;
  private focusableElements: HTMLElement[] = [];
  private focusCols = 1;

  /**
   * 全データを事前ロード。
   */
  async initialize(): Promise<void> {
    this.profile = await root.getProfile.execute('ja');
    const sheet = await root.getSkillSheet.execute('ja');
    this.skills = sheet.skills;
    this.codexEntries = await root.getCodexEntries.execute('ja');

    for (const entry of this.codexEntries) {
      const detail = await root.getGameDetail.execute(entry.id, 'ja');
      if (detail) this.gameDetails.set(entry.id, detail);
    }
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

  override onMounted(): void {
    this.startClock();
    this.navigate('home');
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key;

    // 矢印キー
    if (key === 'ArrowUp') {
      e.preventDefault();
      this.moveFocusUp();
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      this.moveFocusDown();
    } else if (key === 'ArrowLeft') {
      e.preventDefault();
      this.moveFocusLeft();
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      this.moveFocusRight();
    }
    // Aボタン（Enter / Space）
    else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      this.handleFocusClick();
    }
    // Bボタン（Escape）
    else if (key === 'Escape') {
      e.preventDefault();
      this.navigate(this.previousSection);
    }
  }

  private moveFocusUp(): void {
    if (this.focusableElements.length === 0) return;
    const newIndex = Math.max(0, this.currentFocusIndex - this.focusCols);
    this.setFocus(newIndex);
  }

  private moveFocusDown(): void {
    if (this.focusableElements.length === 0) return;
    const newIndex = Math.min(
      this.focusableElements.length - 1,
      this.currentFocusIndex + this.focusCols
    );
    this.setFocus(newIndex);
  }

  private moveFocusLeft(): void {
    if (this.focusableElements.length === 0) return;
    const row = Math.floor(this.currentFocusIndex / this.focusCols);
    const col = this.currentFocusIndex % this.focusCols;
    if (col > 0) {
      this.setFocus(row * this.focusCols + col - 1);
    }
  }

  private moveFocusRight(): void {
    if (this.focusableElements.length === 0) return;
    const row = Math.floor(this.currentFocusIndex / this.focusCols);
    const col = this.currentFocusIndex % this.focusCols;
    if (col < this.focusCols - 1 && this.currentFocusIndex + 1 < this.focusableElements.length) {
      this.setFocus(row * this.focusCols + col + 1);
    }
  }

  private setFocus(index: number): void {
    if (index < 0 || index >= this.focusableElements.length) return;
    // 前のフォーカスを削除
    this.focusableElements[this.currentFocusIndex]?.classList.remove('ds3-focused');
    // 新しいフォーカスを設定
    this.currentFocusIndex = index;
    const el = this.focusableElements[index];
    if (el) {
      el.classList.add('ds3-focused');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  private handleFocusClick(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[this.currentFocusIndex]?.click();
    }
  }

  private simulateKeyEvent(key: string): void {
    const event = new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  private showGameDetailModal(detail: GameDetailVM): void {
    // モーダルバックドロップ
    const backdrop = document.createElement('div');
    backdrop.className = 'ds3-game-modal-backdrop';

    // モーダルコンテナ
    const modal = document.createElement('div');
    modal.className = 'ds3-game-modal';

    // クローズボタン
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ds3-game-modal__close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => backdrop.remove());
    modal.appendChild(closeBtn);

    // コンテンツ
    const content = document.createElement('div');
    content.className = 'ds3-game-modal__content';

    // タイトル
    const title = document.createElement('h2');
    title.className = 'ds3-game-modal__title';
    title.textContent = detail.title;
    content.appendChild(title);

    // 説明
    const desc = document.createElement('p');
    desc.className = 'ds3-game-modal__desc';
    desc.textContent = detail.description;
    content.appendChild(desc);

    // メタ情報
    const metaLines: string[] = [];
    if (detail.year) metaLines.push(detail.year);
    if (detail.teamSize) {
      const sizeStr = String(detail.teamSize);
      metaLines.push(`制作: ${sizeStr.includes('人') ? sizeStr : `${sizeStr}人`}`);
    }
    if (detail.durationDays) {
      const daysStr = String(detail.durationDays);
      metaLines.push(`期間: ${daysStr.includes('日') ? daysStr : `${daysStr}日`}`);
    }
    if (metaLines.length > 0) {
      const metaEl = document.createElement('div');
      metaEl.className = 'ds3-game-modal__meta';
      metaEl.textContent = metaLines.join(' / ');
      content.appendChild(metaEl);
    }

    // ゲーム詳細
    if (detail.detailedFeatures) {
      const section = document.createElement('div');
      section.className = 'ds3-game-modal__section';
      section.innerHTML = `
        <h3 class="ds3-game-modal__label">ゲーム詳細</h3>
        <p class="ds3-game-modal__section-text">${detail.detailedFeatures}</p>
      `;
      content.appendChild(section);
    }

    // 担当範囲
    if (detail.myResponsibilities) {
      const section = document.createElement('div');
      section.className = 'ds3-game-modal__section';
      section.innerHTML = `
        <h3 class="ds3-game-modal__label">担当範囲</h3>
        <p class="ds3-game-modal__section-text">${detail.myResponsibilities}</p>
      `;
      content.appendChild(section);
    }

    // 技術スタック
    if (detail.technologies.length > 0) {
      const section = document.createElement('div');
      section.className = 'ds3-game-modal__section';
      const techLabel = document.createElement('h3');
      techLabel.className = 'ds3-game-modal__label';
      techLabel.textContent = '使用技術';
      section.appendChild(techLabel);

      const techList = document.createElement('div');
      techList.className = 'ds3-game-modal__tech-list';
      detail.technologies.forEach((tech) => {
        const tag = document.createElement('span');
        tag.className = 'ds3-game-modal__tech-tag';
        tag.textContent = tech;
        techList.appendChild(tag);
      });
      section.appendChild(techList);
      content.appendChild(section);
    }

    // リンク
    const links = document.createElement('div');
    links.className = 'ds3-game-modal__links';

    if (detail.installUrl) {
      const link = document.createElement('a');
      link.href = detail.installUrl;
      link.target = '_blank';
      link.className = 'ds3-game-modal__link-btn';
      link.textContent = '▸ プレイ';
      links.appendChild(link);
    } else if (detail.playUrl) {
      const link = document.createElement('a');
      link.href = detail.playUrl;
      link.target = '_blank';
      link.className = 'ds3-game-modal__link-btn';
      link.textContent = '▸ プレイ';
      links.appendChild(link);
    }

    if (detail.githubUrl) {
      const link = document.createElement('a');
      link.href = detail.githubUrl;
      link.target = '_blank';
      link.className = 'ds3-game-modal__link-btn ds3-game-modal__link-btn--sub';
      link.textContent = '▸ Code';
      links.appendChild(link);
    }

    if (links.children.length > 0) {
      content.appendChild(links);
    }

    modal.appendChild(content);
    backdrop.appendChild(modal);

    // バックドロップクリックで閉じる
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    document.body.appendChild(backdrop);

    // フェードイン
    setTimeout(() => {
      backdrop.style.opacity = '1';
    }, 10);
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

    const topBar = document.createElement('div');
    topBar.className = 'ds3-top-bar';
    topBar.innerHTML = `
      <div class="ds3-dot-grn"></div>
      <span id="ds3-top-label">PORTFOLIO</span>
      <span class="ds3-top-clock" id="ds3-top-clock"></span>
    `;
    topScreen.appendChild(topBar);
    this.topLabel = topBar.querySelector('#ds3-top-label');

    // 固定コンテンツ領域（スクロールなし）
    const content = document.createElement('div');
    content.className = 'ds3-top-content';
    content.id = 'ds3-top-content';
    this.topContent = content;
    topScreen.appendChild(content);

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

    const leftCtrl = document.createElement('div');
    leftCtrl.className = 'ds3-left-ctrl';

    const slidePad = document.createElement('div');
    slidePad.className = 'ds3-slide-pad';
    slidePad.innerHTML = '<div class="ds3-slide-pad-inner"></div>';
    leftCtrl.appendChild(slidePad);

    const dpadContainer = document.createElement('div');
    dpadContainer.className = 'ds3-dpad';

    // 十字キー：上下左右
    const dpadUp = document.createElement('button');
    dpadUp.className = 'ds3-dpad-btn ds3-dpad-up';
    dpadUp.addEventListener('click', () => this.simulateKeyEvent('ArrowUp'));
    dpadContainer.appendChild(dpadUp);

    const dpadDown = document.createElement('button');
    dpadDown.className = 'ds3-dpad-btn ds3-dpad-down';
    dpadDown.addEventListener('click', () => this.simulateKeyEvent('ArrowDown'));
    dpadContainer.appendChild(dpadDown);

    const dpadLeft = document.createElement('button');
    dpadLeft.className = 'ds3-dpad-btn ds3-dpad-left';
    dpadLeft.addEventListener('click', () => this.simulateKeyEvent('ArrowLeft'));
    dpadContainer.appendChild(dpadLeft);

    const dpadRight = document.createElement('button');
    dpadRight.className = 'ds3-dpad-btn ds3-dpad-right';
    dpadRight.addEventListener('click', () => this.simulateKeyEvent('ArrowRight'));
    dpadContainer.appendChild(dpadRight);

    const dpadCenter = document.createElement('div');
    dpadCenter.className = 'ds3-dpad-c';
    dpadContainer.appendChild(dpadCenter);

    leftCtrl.appendChild(dpadContainer);
    bottomMain.appendChild(leftCtrl);

    const bottomScreenWrap = document.createElement('div');
    bottomScreenWrap.className = 'ds3-bottom-screen-wrap';

    const bottomBezel = document.createElement('div');
    bottomBezel.className = 'ds3-bottom-bezel';

    const bottomScreen = document.createElement('div');
    bottomScreen.className = 'ds3-bottom-screen';

    // 下画面コンテンツ領域（ビューごとに丸ごと差し替え）
    const content = document.createElement('div');
    content.className = 'ds3-bottom-content';
    content.id = 'ds3-bottom-content';
    this.bottomContent = content;
    bottomScreen.appendChild(content);

    bottomBezel.appendChild(bottomScreen);
    bottomScreenWrap.appendChild(bottomBezel);
    bottomMain.appendChild(bottomScreenWrap);

    const rightCtrl = document.createElement('div');
    rightCtrl.className = 'ds3-right-ctrl';

    const abxyContainer = document.createElement('div');
    abxyContainer.className = 'ds3-abxy';

    // X Y A B ボタン
    const btnX = document.createElement('button');
    btnX.className = 'ds3-ab-btn ds3-btn-x';
    btnX.textContent = 'X';
    btnX.addEventListener('click', () => this.simulateKeyEvent('x'));
    abxyContainer.appendChild(btnX);

    const btnY = document.createElement('button');
    btnY.className = 'ds3-ab-btn ds3-btn-y';
    btnY.textContent = 'Y';
    btnY.addEventListener('click', () => this.simulateKeyEvent('y'));
    abxyContainer.appendChild(btnY);

    const btnA = document.createElement('button');
    btnA.className = 'ds3-ab-btn ds3-btn-a';
    btnA.textContent = 'A';
    btnA.addEventListener('click', () => this.simulateKeyEvent('Enter'));
    abxyContainer.appendChild(btnA);

    const btnB = document.createElement('button');
    btnB.className = 'ds3-ab-btn ds3-btn-b';
    btnB.textContent = 'B';
    btnB.addEventListener('click', () => this.simulateKeyEvent('Escape'));
    abxyContainer.appendChild(btnB);

    rightCtrl.appendChild(abxyContainer);

    const slidePadR = document.createElement('div');
    slidePadR.className = 'ds3-slide-pad-r';
    slidePadR.innerHTML = '<div class="ds3-slide-pad-r-inner"></div>';
    rightCtrl.appendChild(slidePadR);

    bottomMain.appendChild(rightCtrl);

    bodyBottom.appendChild(bottomMain);

    // SELECT / HOME / START + POWER（本体最下部の横一列）
    const shsBar = document.createElement('div');
    shsBar.className = 'ds3-shs-bar';

    const shsGroup = document.createElement('div');
    shsGroup.className = 'ds3-shs-group';

    const backBtn = document.createElement('button');
    backBtn.className = 'ds3-sys-btn';
    backBtn.textContent = 'BACK';
    backBtn.addEventListener('click', () => {
      if (this.previousSection !== this.currentSection) {
        this.navigate(this.previousSection);
      }
    });
    shsGroup.appendChild(backBtn);

    const homeBtn = document.createElement('button');
    homeBtn.className = 'ds3-home-btn';
    homeBtn.id = 'ds3-home-btn';
    homeBtn.innerHTML = '<div class="ds3-home-inner"></div>';
    homeBtn.addEventListener('click', () => this.navigate('home'));
    shsGroup.appendChild(homeBtn);

    const startBtn = document.createElement('button');
    startBtn.className = 'ds3-sys-btn';
    startBtn.textContent = 'START';
    shsGroup.appendChild(startBtn);

    shsBar.appendChild(shsGroup);

    const powerBtn = document.createElement('button');
    powerBtn.className = 'ds3-power-btn';
    powerBtn.innerHTML = '⏻ POWER';
    shsBar.appendChild(powerBtn);

    bodyBottom.appendChild(shsBar);
    return bodyBottom;
  }

  // ===== ナビゲーション =====
  private navigate(view: ViewId): void {
    // 前のセクションを記録
    if (this.currentSection !== view) {
      this.previousSection = this.currentSection;
    }
    this.currentSection = view;

    const labelMap: Record<ViewId, string> = {
      home: 'HOME', about: 'ABOUT', games: 'GAMES',
      skills: 'SKILLS', contact: 'CONTACT', settings: 'SETTINGS', updates: 'UPDATES',
    };
    if (this.topLabel) this.topLabel.textContent = `PORTFOLIO — ${labelMap[view]}`;

    switch (view) {
      case 'home':
        this.setTop(this.topHome());
        this.setBottom(this.bottomHome());
        break;
      case 'about':
        this.setTop(this.topAbout());
        this.setBottom(this.bottomAbout());
        break;
      case 'games':
        this.openGames();
        break;
      case 'skills':
        this.openSkills();
        break;
      case 'contact':
        this.setTop(this.topContact());
        this.setBottom(this.bottomContact());
        break;
      case 'settings':
        this.setTop(this.topSettings());
        this.setBottom(this.bottomSettings());
        break;
      case 'updates':
        this.setTop(this.topPlaceholder('📖 冒険の書', '近日公開予定', '制作の歩みを記録した更新ログをここに掲載します。'));
        this.setBottom(this.bottomBackOnly('📖 UPDATES', []));
        break;
    }
  }

  private setTop(el: HTMLElement): void {
    if (!this.topContent) return;
    // フェードアウト
    this.topContent.style.opacity = '0';
    this.topContent.style.transition = 'opacity 200ms ease-out';

    setTimeout(() => {
      this.topContent!.innerHTML = '';
      this.topContent!.appendChild(el);
      // フェードイン
      this.topContent!.style.opacity = '1';
    }, 200);
  }

  private setBottom(el: HTMLElement): void {
    if (!this.bottomContent) return;
    // フェードアウト
    this.bottomContent.style.opacity = '0';
    this.bottomContent.style.transition = 'opacity 200ms ease-out';

    setTimeout(() => {
      this.bottomContent!.innerHTML = '';
      this.bottomContent!.appendChild(el);
      // フェードイン
      this.bottomContent!.style.opacity = '1';
    }, 200);
  }

  // ===== HOME =====
  private topHome(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-top-home';
    el.innerHTML = `
      <div class="ds3-top-home__hero">
        ${this.profile.imageUrl ? `<img src="${this.profile.imageUrl}" alt="${this.profile.name}" class="ds3-top-home__img">` : ''}
        <div class="ds3-top-home__head">
          <div class="ds3-top-home__name">${this.profile.name}</div>
          <div class="ds3-top-home__title">${this.profile.title}</div>
          <div class="ds3-top-home__lv">LV. <b>${this.profile.level}</b></div>
        </div>
      </div>
      <p class="ds3-top-home__msg">下のアイコンをタップしてセクションを選んでください</p>
      <div class="ds3-top-home__hint">▸ Games / About / Skills / Contact</div>
    `;
    return el;
  }

  private bottomHome(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'ds3-bot-icons';

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 3; // ホームアイコンは3列
    this.currentFocusIndex = 0;

    SECTIONS.forEach((s, idx) => {
      const iconEl = document.createElement('button');
      iconEl.className = 'ds3-bot-icon';
      if (idx === 0) iconEl.classList.add('ds3-focused');
      iconEl.innerHTML = `
        <div class="ds3-bot-icon-em">${s.emoji}</div>
        <div class="ds3-bot-icon-lb">${s.label}</div>
      `;
      iconEl.addEventListener('click', () => this.navigate(s.id));
      grid.appendChild(iconEl);
      this.focusableElements.push(iconEl);
    });

    for (let i = 0; i < 3; i++) {
      const empty = document.createElement('div');
      empty.className = 'ds3-bot-icon ds3-bot-icon-empty';
      grid.appendChild(empty);
    }

    return grid;
  }

  // ===== GAMES =====
  private openGames(): void {
    const first = this.codexEntries[0];
    if (first) {
      const detail = this.gameDetails.get(first.id);
      if (detail) this.setTop(this.topGame(detail));
    }

    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('🎮 GAMES', this.codexEntries.length));

    const grid = document.createElement('div');
    grid.className = 'ds3-game-grid';

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 4; // ゲームグリッドは4列
    this.currentFocusIndex = 0;

    this.codexEntries.forEach((entry, idx) => {
      const card = document.createElement('button');
      card.className = 'ds3-game-card';
      if (idx === 0) {
        card.classList.add('ds3-game-card-sel', 'ds3-focused');
      }
      card.innerHTML = `
        <img src="${entry.thumbnailUrl}" alt="${entry.title}" class="ds3-game-card__thumb">
        <span class="ds3-game-card__title">${entry.title}</span>
      `;
      card.addEventListener('click', () => {
        const oldFocus = grid.querySelector('.ds3-game-card-sel');
        if (oldFocus) oldFocus.classList.remove('ds3-game-card-sel');
        card.classList.add('ds3-game-card-sel');
        // マウスクリック時もフォーカスを更新
        this.currentFocusIndex = this.focusableElements.indexOf(card);
        const detail = this.gameDetails.get(entry.id);
        if (detail) this.setTop(this.topGame(detail));
      });
      grid.appendChild(card);
      this.focusableElements.push(card);
    });

    container.appendChild(grid);
    this.setBottom(container);
  }

  private topGame(d: GameDetailVM): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-game';

    const metaLines: string[] = [];
    if (d.year) metaLines.push(d.year);
    if (d.teamSize) {
      const sizeStr = String(d.teamSize);
      metaLines.push(`制作: ${sizeStr.includes('人') ? sizeStr : `${sizeStr}人`}`);
    }
    if (d.durationDays) {
      const daysStr = String(d.durationDays);
      metaLines.push(`期間: ${daysStr.includes('日') ? daysStr : `${daysStr}日`}`);
    }

    const links: string[] = [];
    if (d.installUrl) links.push(`<a href="${d.installUrl}" target="_blank" class="ds3-game__btn">▸ プレイ</a>`);
    else if (d.playUrl) links.push(`<a href="${d.playUrl}" target="_blank" class="ds3-game__btn">▸ プレイ</a>`);
    if (d.githubUrl) links.push(`<a href="${d.githubUrl}" target="_blank" class="ds3-game__btn ds3-game__btn--sub">▸ Code</a>`);

    el.innerHTML = `
      <div class="ds3-game__media">
        <img src="${d.imageUrls[0] ?? ''}" alt="${d.title}" class="ds3-game__img">
      </div>
      <div class="ds3-game__info">
        <div class="ds3-game__title">${d.title}</div>
        ${d.featuredBadge ? `<span class="ds3-game__badge">${d.featuredBadge}</span>` : ''}
        <div class="ds3-game__meta">${metaLines.join(' / ')}</div>
        <p class="ds3-game__desc">${d.description}</p>
        ${d.detailedFeatures ? `<div class="ds3-game__section"><b class="ds3-game__label">ゲーム詳細</b><p class="ds3-game__text">${d.detailedFeatures}</p></div>` : ''}
        ${d.myResponsibilities ? `<div class="ds3-game__section"><b class="ds3-game__label">担当範囲</b><p class="ds3-game__text">${d.myResponsibilities}</p></div>` : ''}
        <div class="ds3-game__tech">${d.technologies.map((t) => `<span class="ds3-game__tag">${t}</span>`).join('')}</div>
        <div class="ds3-game__links">${links.join('')}</div>
        <button class="ds3-game__detail-btn">詳細を見る ▸</button>
      </div>
    `;

    // 詳細ボタンのイベントリスナー
    const detailBtn = el.querySelector('.ds3-game__detail-btn') as HTMLElement;
    if (detailBtn) {
      detailBtn.addEventListener('click', () => this.showGameDetailModal(d));
    }

    return el;
  }


  // ===== SKILLS =====
  private openSkills(): void {
    if (this.skills[0]) this.setTop(this.topSkill(this.skills[0]));

    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('⚡ SKILLS', this.skills.length));

    const list = document.createElement('div');
    list.className = 'ds3-skill-list';

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 1; // スキルリストは1列
    this.currentFocusIndex = 0;

    this.skills.forEach((skill, idx) => {
      const item = document.createElement('button');
      item.className = 'ds3-skill-item';
      if (idx === 0) {
        item.classList.add('ds3-skill-item-sel', 'ds3-focused');
      }
      item.innerHTML = `
        <span class="ds3-skill-item__name">${skill.title}</span>
        <span class="ds3-skill-item__lv">Lv.${skill.level}</span>
      `;
      item.addEventListener('click', () => {
        const oldFocus = list.querySelector('.ds3-skill-item-sel');
        if (oldFocus) oldFocus.classList.remove('ds3-skill-item-sel');
        item.classList.add('ds3-skill-item-sel');
        // マウスクリック時もフォーカスを更新
        this.currentFocusIndex = this.focusableElements.indexOf(item);
        this.setTop(this.topSkill(skill));
      });
      list.appendChild(item);
      this.focusableElements.push(item);
    });

    container.appendChild(list);
    this.setBottom(container);
  }

  private topSkill(skill: SkillVM): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-skill';

    const head = document.createElement('div');
    head.className = 'ds3-skill__head';
    head.innerHTML = `
      <div class="ds3-skill__title">${skill.title}</div>
      <div class="ds3-skill__lv">Lv. ${skill.level} / 48</div>
    `;
    el.appendChild(head);

    const bar = createExpBar(skill.experiencePercent, skill.experienceText);
    bar.className = 'ds3-skill__exp';
    el.appendChild(bar);

    const body = document.createElement('div');
    body.className = 'ds3-skill__body';
    body.innerHTML = `
      ${skill.additionalSkills.length ? `<div class="ds3-skill__row"><b>習得:</b> ${skill.additionalSkills.join(', ')}</div>` : ''}
      ${skill.projects ? `<div class="ds3-skill__row ds3-skill__row--dim">${skill.projects}</div>` : ''}
    `;
    el.appendChild(body);

    return el;
  }

  // ===== CONTACT =====
  private topContact(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-contact-top';
    el.innerHTML = `
      <div class="ds3-contact-top__icon">✉️</div>
      <div class="ds3-contact-top__title">SEND A LETTER</div>
      <p class="ds3-contact-top__msg">
        下画面のフォームからメッセージを送れます。<br>
        お仕事のご相談・ご感想など、お気軽にどうぞ。
      </p>
    `;
    return el;
  }

  private bottomContact(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('✉️ CONTACT', null));

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 1;
    this.currentFocusIndex = 0;

    const form = document.createElement('form');
    form.className = 'ds3-form';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.className = 'ds3-form__input';
    nameInput.placeholder = 'お名前';
    form.appendChild(nameInput);
    this.focusableElements.push(nameInput);

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.className = 'ds3-form__input';
    emailInput.placeholder = 'メールアドレス';
    form.appendChild(emailInput);
    this.focusableElements.push(emailInput);

    const messageTextarea = document.createElement('textarea');
    messageTextarea.name = 'message';
    messageTextarea.className = 'ds3-form__textarea';
    messageTextarea.placeholder = 'メッセージ';
    messageTextarea.rows = 3;
    form.appendChild(messageTextarea);
    this.focusableElements.push(messageTextarea);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'ds3-form__submit';
    submitBtn.classList.add('ds3-focused');
    submitBtn.textContent = '送信する ▸';
    this.currentFocusIndex = this.focusableElements.length;
    form.appendChild(submitBtn);
    this.focusableElements.push(submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value;
      const email = emailInput.value;
      const message = messageTextarea.value;
      try {
        const result = await root.submitContactLetter.execute(name, email, message);
        alert(result.success ? '送信しました！ありがとうございます。' : '送信に失敗しました。');
        if (result.success) form.reset();
      } catch {
        alert('エラーが発生しました。');
      }
    });

    container.appendChild(form);
    return container;
  }

  // ===== SETTINGS =====
  private topSettings(): HTMLElement {
    return this.topPlaceholder('⚙️ SETTINGS', '設定', '下画面でテーマ・言語を切り替えられます。');
  }

  private bottomSettings(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('⚙️ SETTINGS', null));

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 1;
    this.currentFocusIndex = 0;

    const body = document.createElement('div');
    body.className = 'ds3-settings-body';

    const themeRow = document.createElement('div');
    themeRow.className = 'ds3-settings__row';
    themeRow.innerHTML = '<span>テーマ</span>';
    const themeBtn = document.createElement('button');
    themeBtn.className = 'ds3-settings__btn ds3-focused';
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'night';
    themeBtn.textContent = currentTheme === 'night' ? '🌙 夜' : '☀️ 昼';
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'night';
      const next = cur === 'night' ? 'day' : 'night';
      document.documentElement.setAttribute('data-theme', next);
      root.getPreferenceStore().setTheme(next as 'night' | 'day');
      themeBtn.textContent = next === 'night' ? '🌙 夜' : '☀️ 昼';
    });
    themeRow.appendChild(themeBtn);
    body.appendChild(themeRow);
    this.focusableElements.push(themeBtn);

    const langRow = document.createElement('div');
    langRow.className = 'ds3-settings__row';
    langRow.innerHTML = '<span>言語 / Language</span>';
    const langBtn = document.createElement('button');
    langBtn.className = 'ds3-settings__btn';
    langBtn.textContent = '日本語 / EN';
    langRow.appendChild(langBtn);
    body.appendChild(langRow);
    this.focusableElements.push(langBtn);

    container.appendChild(body);
    return container;
  }

  // ===== ABOUT =====
  private bottomAbout(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('👤 ABOUT', null));

    // キーボード用フォーカス管理を初期化
    this.focusableElements = [];
    this.focusCols = 1;
    this.currentFocusIndex = 0;

    const list = document.createElement('div');
    list.className = 'ds3-link-list';

    this.profile.socialLinks.forEach((link, idx) => {
      const btn = document.createElement('button');
      btn.className = 'ds3-list-link-btn';
      if (idx === 0) btn.classList.add('ds3-focused');
      btn.innerHTML = `${link.icon} ${link.label}`;
      btn.addEventListener('click', () => {
        window.open(link.url, '_blank');
      });
      list.appendChild(btn);
      this.focusableElements.push(btn);
    });

    container.appendChild(list);
    return container;
  }

  private topAbout(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-about';
    el.innerHTML = `
      <div class="ds3-about__hero">
        ${this.profile.imageUrl ? `<img src="${this.profile.imageUrl}" alt="${this.profile.name}" class="ds3-about__img">` : ''}
        <div class="ds3-about__head">
          <div class="ds3-about__name">${this.profile.name}</div>
          <div class="ds3-about__title">${this.profile.title}</div>
          <div class="ds3-about__stats">
            <div class="ds3-about__lv">LV. <b>${this.profile.level}</b></div>
            <div class="ds3-about__hp">HP <span>${'█'.repeat(8)}</span></div>
            <div class="ds3-about__mp">MP <span>${'█'.repeat(6)}</span></div>
          </div>
        </div>
      </div>
      <div class="ds3-about__info">
        <div class="ds3-about__info-row">
          <span class="ds3-about__info-label">名前:</span>
          <span class="ds3-about__info-value">今多悠人</span>
        </div>
        <div class="ds3-about__info-row">
          <span class="ds3-about__info-label">学校:</span>
          <span class="ds3-about__info-value">札幌デザイン&amp;テクノロジー<br>専門学校</span>
        </div>
        <div class="ds3-about__info-row">
          <span class="ds3-about__info-label">学年:</span>
          <span class="ds3-about__info-value">3年生</span>
        </div>
        <div class="ds3-about__info-row">
          <span class="ds3-about__info-label">専攻:</span>
          <span class="ds3-about__info-value">スーパーゲーム<br>クリエイター専攻</span>
        </div>
      </div>
      <p class="ds3-about__desc">${this.profile.description}</p>
    `;
    return el;
  }

  // ===== 共通ヘルパー =====
  private listHeader(title: string, count: number | null): HTMLElement {
    const header = document.createElement('div');
    header.className = 'ds3-list-header';

    const back = document.createElement('button');
    back.className = 'ds3-back-btn';
    back.textContent = '← Home';
    back.addEventListener('click', () => this.navigate('home'));

    const titleEl = document.createElement('span');
    titleEl.className = 'ds3-list-title';
    titleEl.textContent = count !== null ? `${title} (${count})` : title;

    header.appendChild(back);
    header.appendChild(titleEl);
    return header;
  }

  private bottomBackOnly(title: string, items: HTMLElement[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader(title, null));

    if (items.length) {
      const list = document.createElement('div');
      list.className = 'ds3-link-list';
      items.forEach((it) => list.appendChild(it));
      container.appendChild(list);
    }
    return container;
  }

  private topPlaceholder(title: string, subtitle: string, message: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-placeholder';
    el.innerHTML = `
      <h2 class="ds3-placeholder__title">${title}</h2>
      <div class="ds3-placeholder__sub">${subtitle}</div>
      <p class="ds3-placeholder__msg">${message}</p>
    `;
    return el;
  }

  private spkDots(): string {
    return Array.from({ length: 9 }, () => '<div class="ds3-spk-dot"></div>').join('');
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
  background:
    radial-gradient(circle at 50% 38%, #f3f7fb 0%, #d4e2ef 38%, #aec3da 72%, #8ba6c4 100%);
}

.ds3-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-height: 100%;
  /* 上下の本体は同じ幅（実機と同様） */
  --ds3-top-w: 780px;
  --ds3-bottom-w: 780px;
  /* メタリックブルー本体カラー */
  --ds3-blue-top: linear-gradient(160deg, #5aa3e6 0%, #3a78c8 42%, #2a5fae 100%);
  --ds3-blue-bottom: linear-gradient(180deg, #3a78c8 0%, #2a5fae 55%, #214c92 100%);
  --ds3-blue-edge: #1c3f7a;
  --ds3-hinge: linear-gradient(180deg, #224d92 0%, #18356b 100%);
  filter: drop-shadow(0 24px 40px rgba(20, 40, 80, 0.45));
}

/* ===== TOP BODY ===== */
.ds3-body-top {
  width: var(--ds3-top-w);
  max-width: 92vw;
  background: var(--ds3-blue-top);
  border-radius: 18px 18px 4px 4px;
  position: relative;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.45),
    inset 2px 0 4px rgba(255, 255, 255, 0.15),
    inset -2px 0 4px rgba(0, 0, 0, 0.2),
    inset 0 -4px 10px rgba(0, 0, 0, 0.35);
}

.ds3-shoulders {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0; left: -6px; right: -6px;
}

.ds3-shoulder {
  width: 120px; height: 15px;
  background: linear-gradient(180deg, #3a6cb0 0%, #244c8e 100%);
  border: 1px solid #1c3f7a;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: rgba(255, 255, 255, 0.55);
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

/* 上画面コンテンツ（固定・スクロールなし） */
.ds3-top-content {
  flex: 1;
  overflow: hidden;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}

.ds3-ind3d {
  position: absolute; bottom: 8px; right: 10px;
  font-size: 9px; color: #44cc44;
  pointer-events: none;
}

/* ---- HOME (top) ---- */
.ds3-top-home { display: flex; flex-direction: column; gap: 14px; height: 100%; justify-content: center; }
.ds3-top-home__hero { display: flex; align-items: center; gap: 16px; }
.ds3-top-home__img {
  width: 90px; height: 90px; object-fit: cover;
  border: 2px solid var(--accent); image-rendering: pixelated; flex-shrink: 0;
}
.ds3-top-home__name { font-size: clamp(1.2rem, 3vw, 1.8rem); color: var(--accent); }
.ds3-top-home__title { font-size: 0.85rem; color: var(--ink-dim); margin-top: 4px; }
.ds3-top-home__lv { font-size: 0.8rem; color: var(--ink); margin-top: 6px; }
.ds3-top-home__lv b { color: var(--c-gold); }
.ds3-top-home__msg { font-size: 0.85rem; color: var(--ink); text-align: center; }
.ds3-top-home__hint { font-size: 0.75rem; color: var(--accent); text-align: center; }

/* ---- GAME (top) ---- */
.ds3-game { display: grid; grid-template-columns: 35% 1fr; gap: 12px; height: 100%; }
.ds3-game__media { height: 100%; overflow: hidden; }
.ds3-game__img {
  width: 100%; height: 100%; object-fit: cover;
  border: 2px solid var(--line); image-rendering: pixelated;
}
.ds3-game__info { display: flex; flex-direction: column; gap: 3px; overflow: hidden; min-width: 0; }
.ds3-game__title { font-size: clamp(0.9rem, 2.2vw, 1.2rem); color: var(--accent); line-height: 1.1; }
.ds3-game__badge {
  align-self: flex-start; background: var(--c-legendary); color: #1a1a2e;
  font-size: 0.55rem; padding: 1px 4px; border: 1px solid var(--c-gold);
}
.ds3-game__meta { font-size: 0.65rem; color: var(--ink-dim); }
.ds3-game__desc {
  font-size: 0.7rem; color: var(--ink); line-height: 1.4; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.ds3-game__section { display: flex; flex-direction: column; gap: 2px; }
.ds3-game__label { font-size: 0.65rem; color: var(--accent); }
.ds3-game__text { font-size: 0.62rem; color: var(--ink); line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.ds3-game__tech { display: flex; flex-wrap: wrap; gap: 2px; }
.ds3-game__tag {
  font-size: 0.55rem; color: var(--accent); border: 1px solid var(--accent);
  padding: 1px 4px; background: var(--bg-1);
}
.ds3-game__links { display: flex; gap: 4px; margin-top: 2px; }
.ds3-game__btn {
  font-size: 0.62rem; padding: 3px 8px; border: 1px solid var(--c-exp);
  color: var(--c-exp); background: var(--bg-1); text-decoration: none;
}
.ds3-game__btn:hover { background: var(--c-exp); color: #1a1a2e; }
.ds3-game__btn--sub { border-color: var(--accent); color: var(--accent); }
.ds3-game__btn--sub:hover { background: var(--accent); color: #1a1a2e; }

.ds3-game__detail-btn {
  background: rgba(100, 160, 255, 0.2);
  border: 1px solid var(--accent);
  border-radius: 3px;
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: 0.65rem;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 150ms;
  margin-top: 2px;
}

.ds3-game__detail-btn:hover {
  background: var(--accent);
  color: var(--bg-primary);
}

/* ---- SKILL (top) ---- */
.ds3-skill { display: flex; flex-direction: column; gap: 14px; height: 100%; justify-content: center; }
.ds3-skill__head { display: flex; justify-content: space-between; align-items: baseline; }
.ds3-skill__title { font-size: clamp(1.1rem, 3vw, 1.6rem); color: var(--accent); }
.ds3-skill__lv { font-size: 0.8rem; color: var(--ink-dim); }
.ds3-skill__body { display: flex; flex-direction: column; gap: 8px; }
.ds3-skill__row { font-size: 0.82rem; color: var(--ink); line-height: 1.5; }
.ds3-skill__row b { color: var(--accent); }
.ds3-skill__row--dim { color: var(--ink-faint); font-style: italic; font-size: 0.75rem; }

/* ---- ABOUT (top) ---- */
.ds3-about { display: flex; flex-direction: column; gap: 14px; height: 100%; justify-content: center; }
.ds3-about__hero { display: flex; gap: 16px; align-items: center; }
.ds3-about__img {
  width: 100px; height: 100px; object-fit: cover;
  border: 2px solid var(--accent); image-rendering: pixelated; flex-shrink: 0;
}
.ds3-about__name { font-size: clamp(1.2rem, 3vw, 1.7rem); color: var(--accent); }
.ds3-about__title { font-size: 0.85rem; color: var(--ink-dim); margin: 4px 0 8px; }
.ds3-about__stats { display: flex; flex-direction: column; gap: 2px; font-size: 0.72rem; }
.ds3-about__lv b { color: var(--c-gold); }
.ds3-about__hp span { color: var(--c-hp); }
.ds3-about__mp span { color: var(--c-mp); }
.ds3-about__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
  border: 1px solid rgba(100, 160, 255, 0.15);
  border-radius: 4px;
  padding: 8px 10px;
  background: rgba(0, 25, 65, 0.3);
}

.ds3-about__info-row {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.75rem;
  line-height: 1.4;
}

.ds3-about__info-label {
  color: var(--accent);
  font-weight: 500;
}

.ds3-about__info-value {
  color: var(--ink);
}

.ds3-about__desc {
  font-size: 0.75rem; color: var(--ink); line-height: 1.5; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

/* ---- CONTACT (top) ---- */
.ds3-contact-top { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; height: 100%; text-align: center; }
.ds3-contact-top__icon { font-size: 3rem; }
.ds3-contact-top__title { font-size: clamp(1.1rem, 3vw, 1.6rem); color: var(--accent); }
.ds3-contact-top__msg { font-size: 0.85rem; color: var(--ink); line-height: 1.7; }

/* ---- PLACEHOLDER (top) ---- */
.ds3-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; height: 100%; text-align: center; }
.ds3-placeholder__title { font-size: clamp(1.2rem, 3vw, 1.7rem); color: var(--accent); }
.ds3-placeholder__sub { font-size: 0.9rem; color: var(--c-gold); }
.ds3-placeholder__msg { font-size: 0.82rem; color: var(--ink-dim); line-height: 1.6; }

/* ===== HINGE ===== */
.ds3-hinge {
  width: var(--ds3-top-w);
  max-width: 92vw;
  background: var(--ds3-hinge);
  height: 15px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5);
}

.ds3-hinge-nub {
  width: 40px; height: 11px;
  background: linear-gradient(180deg, #2c5798 0%, #16336a 100%);
  border-radius: 6px; border: 1px solid #12305f;
}

/* ===== BOTTOM BODY ===== */
.ds3-body-bottom {
  width: var(--ds3-bottom-w);
  max-width: 96vw;
  background: var(--ds3-blue-bottom);
  border-radius: 4px 4px 40px 40px;
  padding: 12px 0 20px;
  position: relative;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 2px 0 4px rgba(255, 255, 255, 0.12),
    inset -2px 0 4px rgba(0, 0, 0, 0.2),
    inset 0 -6px 14px rgba(0, 0, 0, 0.4);
}

.ds3-bottom-main {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-items: center;
  gap: 18px;
  padding: 0 20px;
}

.ds3-left-ctrl, .ds3-right-ctrl {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-shrink: 0;
  width: 90px;
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

.ds3-dpad {
  position: relative;
  width: 60px;
  height: 60px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 2px;
  align-items: center;
  justify-items: center;
}

.ds3-dpad-btn {
  background: #252525;
  border-radius: 3px;
  border: 1px solid #111;
  color: transparent;
  cursor: pointer;
  transition: all 120ms;
  padding: 0;
  width: 18px;
  height: 18px;
}

.ds3-dpad-btn:hover { background: #3a3a3a; }
.ds3-dpad-btn:active { background: #1c1c1c; }

/* グリッドレイアウトで十字形を作成 */
.ds3-dpad-up {
  grid-column: 2;
  grid-row: 1;
}

.ds3-dpad-left {
  grid-column: 1;
  grid-row: 2;
}

.ds3-dpad-right {
  grid-column: 3;
  grid-row: 2;
}

.ds3-dpad-down {
  grid-column: 2;
  grid-row: 3;
}

.ds3-dpad-c {
  grid-column: 2;
  grid-row: 2;
  width: 12px;
  height: 12px;
  background: #1c1c1c;
  z-index: 2;
  pointer-events: none;
  border-radius: 2px;
}

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

.ds3-bottom-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ---- HOME icons (bottom) ---- */
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
  font-family: var(--font-pixel);
}

.ds3-bot-icon:hover {
  background: rgba(20, 50, 120, 0.5);
  border-color: rgba(100, 160, 255, 0.3);
  transform: translateY(-2px);
}

.ds3-bot-icon-empty {
  background: rgba(0, 15, 40, 0.3);
  border-style: dashed;
  cursor: default;
}
.ds3-bot-icon-empty:hover { transform: none; background: rgba(0, 15, 40, 0.3); border-color: rgba(100,160,255,0.12); }

.ds3-bot-icon.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.8), inset 0 0 8px rgba(100, 160, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.8);
}

.ds3-bot-icon-em { font-size: 24px; }
.ds3-bot-icon-lb { color: rgba(150, 200, 255, 0.85); font-size: 9px; text-align: center; }

/* ---- LIST VIEW (bottom shared) ---- */
.ds3-list-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.ds3-list-header {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(10, 25, 60, 0.95);
  border-bottom: 1px solid rgba(100, 160, 255, 0.15);
  flex-shrink: 0;
}

.ds3-back-btn {
  background: rgba(60, 20, 80, 0.5);
  border: 1px solid rgba(180, 100, 255, 0.3);
  border-radius: 4px;
  color: rgba(200, 150, 255, 0.9);
  font-size: 9px; padding: 3px 7px; cursor: pointer;
  font-family: var(--font-pixel);
}
.ds3-back-btn:hover { background: rgba(90, 40, 120, 0.6); }

.ds3-list-title { font-size: 10px; color: rgba(180, 210, 255, 0.9); }

/* ---- GAME grid (bottom) ---- */
.ds3-game-grid {
  flex: 1; overflow-y: auto;
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 6px; padding: 8px;
}

.ds3-game-card {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: rgba(0, 25, 65, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.12);
  border-radius: 6px; padding: 4px; cursor: pointer;
  transition: all 120ms; font-family: var(--font-pixel);
}
.ds3-game-card:hover { background: rgba(20, 50, 120, 0.5); transform: translateY(-2px); }
.ds3-game-card-sel {
  background: rgba(35, 80, 190, 0.55);
  border-color: rgba(100, 180, 255, 0.5);
}

.ds3-game-card.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.8), inset 0 0 8px rgba(100, 160, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.8);
}

.ds3-game-card__thumb {
  width: 100%; aspect-ratio: 1; object-fit: cover;
  border: 1px solid rgba(100,160,255,0.2); image-rendering: pixelated;
}
.ds3-game-card__title {
  font-size: 7px; color: rgba(150, 200, 255, 0.85); text-align: center;
  line-height: 1.2; max-width: 100%;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ---- SKILL list (bottom) ---- */
.ds3-skill-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; padding: 8px; }
.ds3-skill-item {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0, 25, 65, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.12);
  border-radius: 5px; padding: 7px 10px; cursor: pointer;
  transition: all 120ms; font-family: var(--font-pixel);
}
.ds3-skill-item:hover { background: rgba(20, 50, 120, 0.5); }
.ds3-skill-item-sel {
  background: rgba(35, 80, 190, 0.55);
  border-color: rgba(100, 180, 255, 0.5);
}
.ds3-skill-item__name { font-size: 10px; color: rgba(180, 210, 255, 0.95); }
.ds3-skill-item__lv { font-size: 9px; color: var(--c-gold); }

/* ---- LINK list (bottom, about) ---- */
.ds3-link-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 10px; }
.ds3-list-link, .ds3-list-link-btn {
  background: rgba(0, 25, 65, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.2);
  border-radius: 5px; padding: 9px 12px;
  color: rgba(180, 210, 255, 0.95); font-size: 11px;
  text-decoration: none; transition: all 120ms;
  font-family: var(--font-pixel); cursor: pointer;
}
.ds3-list-link:hover, .ds3-list-link-btn:hover { background: rgba(20, 50, 120, 0.5); color: #fff; }

.ds3-list-link-btn.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.8), inset 0 0 8px rgba(100, 160, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.8);
}

/* ---- FORM (bottom, contact) ---- */
.ds3-form { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 8px; overflow-y: auto; }
.ds3-form__input, .ds3-form__textarea {
  background: rgba(0, 15, 40, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.25);
  border-radius: 4px; padding: 6px 8px;
  color: #dceaff; font-size: 11px; font-family: var(--font-body);
  transition: all 120ms;
}
.ds3-form__input:focus, .ds3-form__textarea:focus { outline: none; border-color: var(--accent); }

.ds3-form__input.ds3-focused, .ds3-form__textarea.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.6), inset 0 0 8px rgba(100, 160, 255, 0.2);
  border-color: rgba(100, 180, 255, 0.8);
}

.ds3-form__textarea { resize: none; }
.ds3-form__submit {
  background: rgba(50, 110, 220, 0.7);
  border: 1px solid rgba(100, 180, 255, 0.5);
  border-radius: 4px; padding: 7px; color: #fff;
  font-size: 11px; cursor: pointer; font-family: var(--font-pixel);
  transition: all 120ms;
}
.ds3-form__submit:hover { background: rgba(70, 130, 240, 0.85); }

.ds3-form__submit.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.8), inset 0 0 8px rgba(100, 160, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.8);
}

/* ---- SETTINGS (bottom) ---- */
.ds3-settings-body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 10px; }
.ds3-settings__row {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0, 25, 65, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.15);
  border-radius: 5px; padding: 8px 10px;
  color: rgba(180, 210, 255, 0.95); font-size: 10px;
}
.ds3-settings__btn {
  background: rgba(50, 110, 220, 0.6);
  border: 1px solid rgba(100, 180, 255, 0.4);
  border-radius: 4px; padding: 5px 10px; color: #fff;
  font-size: 10px; cursor: pointer; font-family: var(--font-pixel);
  transition: all 120ms;
}
.ds3-settings__btn:hover { background: rgba(70, 130, 240, 0.8); }

.ds3-settings__btn.ds3-focused {
  box-shadow: 0 0 12px rgba(100, 160, 255, 0.8), inset 0 0 8px rgba(100, 160, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.8);
}

/* スクロールバー */
.ds3-game-grid::-webkit-scrollbar, .ds3-skill-list::-webkit-scrollbar,
.ds3-link-list::-webkit-scrollbar, .ds3-form::-webkit-scrollbar { width: 6px; }
.ds3-game-grid::-webkit-scrollbar-thumb, .ds3-skill-list::-webkit-scrollbar-thumb,
.ds3-link-list::-webkit-scrollbar-thumb, .ds3-form::-webkit-scrollbar-thumb {
  background: rgba(100,160,255,0.4); border-radius: 3px;
}

/* SELECT / HOME / START + POWER（本体最下部の横一列） */
.ds3-shs-bar {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 14px;
  padding: 0 30px;
}
.ds3-shs-group { display: flex; align-items: center; gap: 28px; }
.ds3-sys-btn {
  min-width: 56px; height: 16px;
  background: linear-gradient(180deg, #d8dde4 0%, #b3bcc8 100%);
  border-radius: 8px; border: 1px solid #8b94a3;
  color: #3a4150; font-size: 8px; letter-spacing: 1px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-family: var(--font-pixel);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
}
.ds3-sys-btn:hover { background: linear-gradient(180deg, #e6eaef 0%, #c2cad6 100%); }
.ds3-home-btn {
  width: 30px; height: 30px;
  background: linear-gradient(180deg, #d8dde4 0%, #aab4c2 100%);
  border-radius: 50%; border: 2px solid #8b94a3;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.6);
}
.ds3-home-btn:hover { background: linear-gradient(180deg, #e6eaef 0%, #bcc5d2 100%); }
.ds3-home-inner {
  width: 11px; height: 11px;
  border: 1.5px solid #6b7585; border-radius: 2px;
  pointer-events: none;
}
.ds3-power-btn {
  position: absolute;
  right: 36px;
  background: linear-gradient(180deg, #3a6cb0 0%, #244c8e 100%);
  border: 1px solid #1c3f7a; border-radius: 8px;
  color: rgba(255,255,255,0.85); font-size: 8px; letter-spacing: 1px;
  padding: 4px 10px; cursor: pointer; font-family: var(--font-pixel);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25);
}
.ds3-power-btn:hover { filter: brightness(1.15); }

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
  cursor: pointer;
  transition: all 120ms;
}

.ds3-ab-btn:hover { transform: scale(1.1); }
.ds3-ab-btn:active { transform: scale(0.95); }
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

/* ===== GAME DETAIL MODAL ===== */
.ds3-game-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 300ms ease-out;
  padding: 20px;
}

.ds3-game-modal {
  background: var(--bg-window);
  border: 3px solid var(--line);
  border-radius: 0;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  position: relative;
  animation: modalSlideIn 300ms ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.ds3-game-modal__close {
  position: sticky;
  top: 0;
  right: 0;
  float: right;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 1.8rem;
  cursor: pointer;
  padding: 12px 16px;
  z-index: 1;
  transition: transform 150ms;
}

.ds3-game-modal__close:hover {
  transform: scale(1.3);
}

.ds3-game-modal__content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ds3-game-modal__title {
  font-family: var(--font-pixel);
  font-size: clamp(1.4rem, 5vw, 2rem);
  color: var(--accent);
  margin: 0;
}

.ds3-game-modal__desc {
  font-size: 0.95rem;
  color: var(--ink);
  line-height: 1.8;
  margin: 0;
}

.ds3-game-modal__meta {
  font-family: var(--font-pixel);
  font-size: 0.9rem;
  color: var(--ink-dim);
}

.ds3-game-modal__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds3-game-modal__label {
  font-family: var(--font-pixel);
  font-size: 1.1rem;
  color: var(--accent);
  margin: 0;
  border-bottom: 2px solid var(--line);
  padding-bottom: 8px;
}

.ds3-game-modal__section-text {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.ds3-game-modal__tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ds3-game-modal__tech-tag {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid var(--accent);
  background: var(--bg-1);
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: 0.85rem;
  border-radius: 3px;
}

.ds3-game-modal__links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.ds3-game-modal__link-btn {
  padding: 10px 16px;
  border: 2px solid var(--c-exp);
  background: var(--bg-1);
  color: var(--c-exp);
  font-family: var(--font-pixel);
  font-size: 0.9rem;
  text-decoration: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 150ms;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.ds3-game-modal__link-btn:hover {
  background: var(--c-exp);
  color: var(--bg-primary);
}

.ds3-game-modal__link-btn--sub {
  border-color: var(--accent);
  color: var(--accent);
}

.ds3-game-modal__link-btn--sub:hover {
  background: var(--accent);
  color: var(--bg-primary);
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
  .ds3-game { grid-template-columns: 1fr; }
  .ds3-game__media { height: 90px; }
  .ds3-game-grid { grid-template-columns: repeat(3, 1fr); }
}
`;
