import { Component } from '../../core/Component';
import { root } from '@app/composition-root';
import type { ProfileVM } from '@application/index';

/**
 * About セクション: プレイヤーステータス風。
 */
export class AboutSection extends Component {
  private profile: ProfileVM | null = null;

  async initialize(): Promise<void> {
    this.profile = await root.getProfile.execute('ja');
  }

  render(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'about';
    section.className = 'about-section section';

    const title = document.createElement('h2');
    title.className = 'section__title';
    title.textContent = '▸ PLAYER STATUS';
    section.appendChild(title);

    if (!this.profile) {
      return section;
    }

    // プロフィールカード
    const card = document.createElement('div');
    card.className = 'about-card';

    // 左: プロフィール画像
    const imageArea = document.createElement('div');
    imageArea.className = 'about-card__image';
    if (this.profile.imageUrl) {
      const img = document.createElement('img');
      img.src = this.profile.imageUrl;
      img.alt = this.profile.name;
      imageArea.appendChild(img);
    }
    card.appendChild(imageArea);

    // 右: 情報
    const infoArea = document.createElement('div');
    infoArea.className = 'about-card__info';

    // 名前とタイトル
    const nameEl = document.createElement('h3');
    nameEl.className = 'about-card__name';
    nameEl.textContent = this.profile.name;
    infoArea.appendChild(nameEl);

    const titleEl = document.createElement('p');
    titleEl.className = 'about-card__title';
    titleEl.textContent = this.profile.title;
    infoArea.appendChild(titleEl);

    // ステータスバー
    const statsEl = document.createElement('div');
    statsEl.className = 'about-card__stats';
    statsEl.innerHTML = `
      <div class="stat-line">LV. <span class="stat-value">${this.profile.level}</span></div>
      <div class="stat-bar">HP <span class="hp-bar">████████</span></div>
      <div class="stat-bar">MP <span class="mp-bar">██████</span></div>
    `;
    infoArea.appendChild(statsEl);

    // 説明文
    const descEl = document.createElement('p');
    descEl.className = 'about-card__desc';
    descEl.textContent = this.profile.description;
    infoArea.appendChild(descEl);

    // ソーシャルリンク
    if (this.profile.socialLinks.length > 0) {
      const links = document.createElement('div');
      links.className = 'about-card__links';
      this.profile.socialLinks.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.className = 'about-card__link';
        a.textContent = `${link.icon} ${link.label}`;
        links.appendChild(a);
      });
      infoArea.appendChild(links);
    }

    card.appendChild(infoArea);
    section.appendChild(card);

    return section;
  }
}

/**
 * About Section CSS。
 */
export const ABOUT_SECTION_STYLES = `
.about-section {
  background: transparent;
}

.about-card {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-6);
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6);
  border: 3px solid var(--line);
  background: var(--bg-window);
  box-shadow: var(--window-shadow);
}

.about-card__image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-card__image img {
  max-width: 100%;
  height: auto;
  border: 2px solid var(--line);
  image-rendering: pixelated;
}

.about-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.about-card__name {
  font-family: var(--font-pixel);
  font-size: var(--fs-2xl);
  color: var(--accent);
  margin: 0;
}

.about-card__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--ink-dim);
  margin: 0;
}

.about-card__stats {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-line {
  display: flex;
  gap: var(--space-2);
}

.stat-value {
  color: var(--c-gold);
  font-weight: bold;
}

.stat-bar {
  display: flex;
  gap: var(--space-2);
}

.hp-bar {
  color: var(--c-hp);
}

.mp-bar {
  color: var(--c-mp);
}

.about-card__desc {
  font-size: var(--fs-base);
  line-height: 1.8;
  color: var(--ink);
  margin: 0;
}

.about-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.about-card__link {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--line);
  background: var(--bg-1);
  color: var(--accent);
  text-decoration: none;
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  transition: all 150ms;
}

.about-card__link:hover {
  background: var(--accent);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .about-card {
    grid-template-columns: 1fr;
  }
}
`;
