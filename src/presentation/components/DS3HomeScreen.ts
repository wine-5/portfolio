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
    leftCtrl.innerHTML = `
      <div class="ds3-slide-pad"><div class="ds3-slide-pad-inner"></div></div>
      <div class="ds3-dpad">
        <div class="ds3-dpad-h"></div>
        <div class="ds3-dpad-v"></div>
        <div class="ds3-dpad-c"></div>
      </div>
    `;
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

    const shsRow = document.createElement('div');
    shsRow.className = 'ds3-shs-row';
    shsRow.innerHTML = `
      <div class="ds3-shs-btn"><span>SEL</span></div>
      <div class="ds3-home-btn" id="ds3-home-btn"><div class="ds3-home-inner"></div></div>
      <div class="ds3-shs-btn"><span>STA</span></div>
    `;
    shsRow.querySelector('#ds3-home-btn')?.addEventListener('click', () => this.navigate('home'));

    bottomScreenWrap.appendChild(bottomBezel);
    bottomScreenWrap.appendChild(shsRow);
    bottomMain.appendChild(bottomScreenWrap);

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

  // ===== ナビゲーション =====
  private navigate(view: ViewId): void {
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
        this.setBottom(this.bottomBackOnly('👤 ABOUT', this.profile.socialLinks.map((l) => {
          const a = document.createElement('a');
          a.className = 'ds3-list-link';
          a.href = l.url;
          a.target = '_blank';
          a.textContent = `${l.icon} ${l.label}`;
          return a;
        })));
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
    this.topContent.innerHTML = '';
    this.topContent.appendChild(el);
  }

  private setBottom(el: HTMLElement): void {
    if (!this.bottomContent) return;
    this.bottomContent.innerHTML = '';
    this.bottomContent.appendChild(el);
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

    SECTIONS.forEach((s) => {
      const iconEl = document.createElement('button');
      iconEl.className = 'ds3-bot-icon';
      iconEl.innerHTML = `
        <div class="ds3-bot-icon-em">${s.emoji}</div>
        <div class="ds3-bot-icon-lb">${s.label}</div>
      `;
      iconEl.addEventListener('click', () => this.navigate(s.id));
      grid.appendChild(iconEl);
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

    this.codexEntries.forEach((entry, idx) => {
      const card = document.createElement('button');
      card.className = 'ds3-game-card';
      if (idx === 0) card.classList.add('ds3-game-card-sel');
      card.innerHTML = `
        <img src="${entry.thumbnailUrl}" alt="${entry.title}" class="ds3-game-card__thumb">
        <span class="ds3-game-card__title">${entry.title}</span>
      `;
      card.addEventListener('click', () => {
        grid.querySelectorAll('.ds3-game-card').forEach((c) => c.classList.remove('ds3-game-card-sel'));
        card.classList.add('ds3-game-card-sel');
        const detail = this.gameDetails.get(entry.id);
        if (detail) this.setTop(this.topGame(detail));
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
    this.setBottom(container);
  }

  private topGame(d: GameDetailVM): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ds3-game';

    const meta: string[] = [];
    if (d.year) meta.push(d.year);
    if (d.teamSize) meta.push(`${d.teamSize}人`);
    if (d.durationDays) meta.push(`${d.durationDays}日`);

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
        <div class="ds3-game__meta">${meta.join(' / ')}</div>
        <p class="ds3-game__desc">${d.description}</p>
        <div class="ds3-game__stats">
          ${this.statRow('難易度', d.stat.difficulty)}
          ${this.statRow('独創性', d.stat.novelty)}
          ${this.statRow('品質', d.stat.quality)}
        </div>
        <div class="ds3-game__tech">${d.technologies.map((t) => `<span class="ds3-game__tag">${t}</span>`).join('')}</div>
        <div class="ds3-game__links">${links.join('')}</div>
      </div>
    `;
    return el;
  }

  private statRow(label: string, value: number): string {
    return `
      <div class="ds3-stat">
        <span class="ds3-stat__lb">${label}</span>
        <span class="ds3-stat__bar"><span class="ds3-stat__fill" style="width:${(value / 5) * 100}%"></span></span>
        <span class="ds3-stat__val">${value}/5</span>
      </div>
    `;
  }

  // ===== SKILLS =====
  private openSkills(): void {
    if (this.skills[0]) this.setTop(this.topSkill(this.skills[0]));

    const container = document.createElement('div');
    container.className = 'ds3-list-view';
    container.appendChild(this.listHeader('⚡ SKILLS', this.skills.length));

    const list = document.createElement('div');
    list.className = 'ds3-skill-list';

    this.skills.forEach((skill, idx) => {
      const item = document.createElement('button');
      item.className = 'ds3-skill-item';
      if (idx === 0) item.classList.add('ds3-skill-item-sel');
      item.innerHTML = `
        <span class="ds3-skill-item__name">${skill.title}</span>
        <span class="ds3-skill-item__lv">Lv.${skill.level}</span>
      `;
      item.addEventListener('click', () => {
        list.querySelectorAll('.ds3-skill-item').forEach((c) => c.classList.remove('ds3-skill-item-sel'));
        item.classList.add('ds3-skill-item-sel');
        this.setTop(this.topSkill(skill));
      });
      list.appendChild(item);
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

    const form = document.createElement('form');
    form.className = 'ds3-form';
    form.innerHTML = `
      <input type="text" name="name" class="ds3-form__input" placeholder="お名前">
      <input type="email" name="email" class="ds3-form__input" placeholder="メールアドレス">
      <textarea name="message" class="ds3-form__textarea" placeholder="メッセージ" rows="3"></textarea>
      <button type="submit" class="ds3-form__submit">送信する ▸</button>
    `;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (form.querySelector('[name="name"]') as HTMLInputElement).value;
      const email = (form.querySelector('[name="email"]') as HTMLInputElement).value;
      const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement).value;
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

    const body = document.createElement('div');
    body.className = 'ds3-settings-body';

    const themeRow = document.createElement('div');
    themeRow.className = 'ds3-settings__row';
    themeRow.innerHTML = '<span>テーマ</span>';
    const themeBtn = document.createElement('button');
    themeBtn.className = 'ds3-settings__btn';
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

    const langRow = document.createElement('div');
    langRow.className = 'ds3-settings__row';
    langRow.innerHTML = '<span>言語 / Language</span>';
    const langBtn = document.createElement('button');
    langBtn.className = 'ds3-settings__btn';
    langBtn.textContent = '日本語 / EN';
    langRow.appendChild(langBtn);
    body.appendChild(langRow);

    container.appendChild(body);
    return container;
  }

  // ===== ABOUT =====
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
.ds3-game { display: grid; grid-template-columns: 40% 1fr; gap: 16px; height: 100%; }
.ds3-game__media { height: 100%; overflow: hidden; }
.ds3-game__img {
  width: 100%; height: 100%; object-fit: cover;
  border: 2px solid var(--line); image-rendering: pixelated;
}
.ds3-game__info { display: flex; flex-direction: column; gap: 6px; overflow: hidden; min-width: 0; }
.ds3-game__title { font-size: clamp(1rem, 2.5vw, 1.4rem); color: var(--accent); line-height: 1.2; }
.ds3-game__badge {
  align-self: flex-start; background: var(--c-legendary); color: #1a1a2e;
  font-size: 0.65rem; padding: 2px 6px; border: 1px solid var(--c-gold);
}
.ds3-game__meta { font-size: 0.7rem; color: var(--ink-dim); }
.ds3-game__desc {
  font-size: 0.78rem; color: var(--ink); line-height: 1.5; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.ds3-game__stats { display: flex; flex-direction: column; gap: 3px; }
.ds3-stat { display: grid; grid-template-columns: 48px 1fr 32px; gap: 6px; align-items: center; }
.ds3-stat__lb { font-size: 0.65rem; color: var(--ink-dim); }
.ds3-stat__bar { height: 8px; background: var(--bg-1); border: 1px solid var(--line); overflow: hidden; }
.ds3-stat__fill { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), var(--c-magenta)); }
.ds3-stat__val { font-size: 0.6rem; color: var(--accent); text-align: right; }
.ds3-game__tech { display: flex; flex-wrap: wrap; gap: 4px; }
.ds3-game__tag {
  font-size: 0.62rem; color: var(--accent); border: 1px solid var(--accent);
  padding: 1px 5px; background: var(--bg-1);
}
.ds3-game__links { display: flex; gap: 6px; margin-top: auto; }
.ds3-game__btn {
  font-size: 0.7rem; padding: 4px 10px; border: 2px solid var(--c-exp);
  color: var(--c-exp); background: var(--bg-1); text-decoration: none;
}
.ds3-game__btn:hover { background: var(--c-exp); color: #1a1a2e; }
.ds3-game__btn--sub { border-color: var(--accent); color: var(--accent); }
.ds3-game__btn--sub:hover { background: var(--accent); color: #1a1a2e; }

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
.ds3-about__desc {
  font-size: 0.8rem; color: var(--ink); line-height: 1.6; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
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
  box-shadow: 0 0 8px rgba(100, 160, 255, 0.4);
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
.ds3-list-link {
  background: rgba(0, 25, 65, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.2);
  border-radius: 5px; padding: 9px 12px;
  color: rgba(180, 210, 255, 0.95); font-size: 11px;
  text-decoration: none; transition: all 120ms;
}
.ds3-list-link:hover { background: rgba(20, 50, 120, 0.5); color: #fff; }

/* ---- FORM (bottom, contact) ---- */
.ds3-form { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 8px; overflow-y: auto; }
.ds3-form__input, .ds3-form__textarea {
  background: rgba(0, 15, 40, 0.6);
  border: 1px solid rgba(100, 160, 255, 0.25);
  border-radius: 4px; padding: 6px 8px;
  color: #dceaff; font-size: 11px; font-family: var(--font-body);
}
.ds3-form__input:focus, .ds3-form__textarea:focus { outline: none; border-color: var(--accent); }
.ds3-form__textarea { resize: none; }
.ds3-form__submit {
  background: rgba(50, 110, 220, 0.7);
  border: 1px solid rgba(100, 180, 255, 0.5);
  border-radius: 4px; padding: 7px; color: #fff;
  font-size: 11px; cursor: pointer; font-family: var(--font-pixel);
}
.ds3-form__submit:hover { background: rgba(70, 130, 240, 0.85); }

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
}
.ds3-settings__btn:hover { background: rgba(70, 130, 240, 0.8); }

/* スクロールバー */
.ds3-game-grid::-webkit-scrollbar, .ds3-skill-list::-webkit-scrollbar,
.ds3-link-list::-webkit-scrollbar, .ds3-form::-webkit-scrollbar { width: 6px; }
.ds3-game-grid::-webkit-scrollbar-thumb, .ds3-skill-list::-webkit-scrollbar-thumb,
.ds3-link-list::-webkit-scrollbar-thumb, .ds3-form::-webkit-scrollbar-thumb {
  background: rgba(100,160,255,0.4); border-radius: 3px;
}

/* SELECT HOME START */
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
  cursor: pointer;
}
.ds3-home-btn:hover { background: #3a3a3a; }
.ds3-home-inner { width: 12px; height: 12px; background: #3a3a3a; border-radius: 50%; border: 1px solid #222; pointer-events: none; }

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
  .ds3-game { grid-template-columns: 1fr; }
  .ds3-game__media { height: 90px; }
  .ds3-game-grid { grid-template-columns: repeat(3, 1fr); }
}
`;
