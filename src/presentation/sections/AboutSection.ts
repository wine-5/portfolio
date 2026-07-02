import type { Profile } from '@domain/entities/Profile';
import { gaugePercent } from '@domain/entities/Profile';
import { View } from '../components/View';
import { esc, asset } from '../util/html';
import '../styles/about.css';

/** 本人を主人公キャラとして表示するプレイヤーステータス風 About */
export class AboutSection extends View<Profile> {
  constructor() {
    super('section', 'about');
    this.el.id = 'about';
  }

  override render(profile: Profile): void {
    this.el.innerHTML = `
      <header class="about__header">
        <p class="about__kicker">// PLAYER STATUS</p>
        <h2 class="about__title">ABOUT</h2>
      </header>
      <div class="about__panel">
        <div class="about__avatar">
          <img src="${asset(profile.avatar)}" alt="${esc(profile.name)}" loading="lazy" />
        </div>
        <div class="about__status">
          <span class="name-label">NAME</span>
          <h3 class="about__name">${esc(profile.name)}</h3>
          <p class="about__job">${esc(profile.job)}</p>
          ${gaugeRow('hp', profile.hp.label, gaugePercent(profile.hp), `${profile.hp.current}/${profile.hp.max}`)}
          ${gaugeRow('mp', profile.mp.label, gaugePercent(profile.mp), `${profile.mp.current}/${profile.mp.max}`)}
          <div class="about__exp">
            <span class="about__gauge-label">${esc(profile.expLabel)}</span>
            <div class="about__exp-langs">
              ${profile.expLanguages.map((l) => `<span>${esc(l)}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="about__bio">
          <p>${esc(profile.description).replace(/\n/g, '<br />')}</p>
          <div class="about__links">
            ${profile.links
              .map(
                (l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.animateGaugesOnScroll();
  }

  /** セクションが見えたタイミングでゲージを伸ばす */
  private animateGaugesOnScroll(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.el.querySelectorAll<HTMLElement>('.about__gauge-fill').forEach((fill) => {
            fill.style.width = fill.dataset['value'] ?? '0%';
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(this.el);
  }
}

function gaugeRow(kind: 'hp' | 'mp', label: string, percent: number, value: string): string {
  return `
    <div class="about__gauge about__gauge--${kind}">
      <span class="about__gauge-label">${esc(label)}</span>
      <div class="about__gauge-track">
        <span class="about__gauge-fill" data-value="${percent}%"></span>
        <span class="about__gauge-value">${esc(value)}</span>
      </div>
    </div>`;
}
