import type { Profile } from '@domain/entities/Profile';
import { gaugePercent } from '@domain/entities/Profile';
import { View } from '../components/View';
import { esc, asset, linkIcon } from '../util/html';
import { t } from '../i18n/uiStrings';
import { canRunWineRig, startWineRig, type WineRigHandle } from '../vendor/wine-icon-rig/wine-rig.js';
import '../styles/about.css';

/**
 * 動いているアイコン。言語切り替えで About が作り直されたとき、古いアイコンの描画を止めるために持っておく
 * (セクションは毎回 new されるので、インスタンスではなくモジュールで 1 つだけ管理する)
 */
let activeRig: WineRigHandle | null = null;

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
        <h2 class="about__title">${esc(t('aboutTitle'))}</h2>
      </header>
      <div class="about__panel">
        <div class="about__avatar">
          <img src="${asset(profile.avatar)}" alt="${esc(profile.name)}" width="500" height="500" loading="lazy" />
          <canvas aria-hidden="true"></canvas>
        </div>
        <div class="about__status">
          <span class="name-label">NAME</span>
          <h3 class="about__name">${esc(profile.name)}</h3>
          <p class="about__job">${esc(profile.job)}</p>
          <dl class="about__details">
            ${profile.details
              .map(
                (d) => `
                  <div class="about__detail">
                    <dt>${esc(d.label)}</dt>
                    <dd>${esc(d.value)}</dd>
                  </div>`,
              )
              .join('')}
          </dl>
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
                (l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${linkIcon(l.url)}${esc(l.label)}</a>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.animateGaugesOnScroll();
    this.startAvatarRig();
  }

  /**
   * アイコンを Live2D 風に動かす(まばたき・マウスの方向を見る・呼吸・髪の揺れ)。
   * 動き出すまでと、WebGL が無い / 動きを減らす設定の環境では静止画のまま
   */
  private startAvatarRig(): void {
    activeRig?.stop();
    activeRig = null;
    if (!canRunWineRig()) return;

    const box = this.el.querySelector<HTMLElement>('.about__avatar')!;
    startWineRig(box.querySelector('canvas')!, { modelUrl: asset('wine-icon-rig/wine_rig.json') })
      .then((rig) => {
        // 読み込み中に言語が切り替わり、このアイコンが画面から外れていたら止める
        if (!box.isConnected) return rig.stop();
        activeRig = rig;
        box.classList.add('is-live');
      })
      .catch((e: unknown) => console.warn('wine icon rig disabled:', e));
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
