import type { Skill } from '@domain/entities/Skill';
import type { SkillMatrix } from '@application/usecases/GetPlayerSkills';
import { View } from '../components/View';
import { esc, skillIcon } from '../util/html';
import { t, formatExperience } from '../i18n/uiStrings';
import '../styles/skills.css';

/** EXP バーの満タン基準(この月数で 100%) */
const EXP_FULL_MONTHS = 36;

/**
 * 言語 / ツール&エンジンの 2 グループで表示するスキルセクション。
 * カードの「詳細」でできること・関連作品を展開する。
 * スキルの追加は public/data/locales/{ja,en,zh}/skills.json に 1 ブロック足すだけ。
 */
export class SkillsSection extends View<SkillMatrix> {
  private onSelectGame: (githubUrl: string) => void = () => {};
  private titleOf: (githubUrl: string) => string = () => '';

  constructor() {
    super('section', 'skills');
    this.el.id = 'skills';
  }

  /** 関連作品クリック時に図鑑カードへ移動させるフック */
  setOnSelectGame(fn: (githubUrl: string) => void): void {
    this.onSelectGame = fn;
  }

  /** githubUrl から作品タイトルを引く関数(ボタンのラベルに使う) */
  setGameTitleResolver(fn: (githubUrl: string) => string): void {
    this.titleOf = fn;
  }

  override render(matrix: SkillMatrix): void {
    this.el.innerHTML = `
      <header class="skills__header">
        <p class="skills__kicker">// SKILL MATRIX</p>
        <h2 class="skills__title">${esc(t('skillsTitle'))}</h2>
      </header>
      ${group('languages', t('groupLanguages'), matrix.languages, this.titleOf, true)}
      ${group('tools', t('groupTools'), matrix.tools, this.titleOf, false)}
    `;

    // グループ全体の折りたたみ(カード数が多いので、見たいグループだけ開ける)
    this.el.querySelectorAll<HTMLButtonElement>('[data-group-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.skills__section');
        if (!wrap) return;
        const open = wrap.classList.toggle('skills__section--open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    // 詳細の開閉
    this.el.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.skill-card');
        if (!card) return;
        const open = card.classList.toggle('skill-card--open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    // 関連作品 → 図鑑カードへ
    this.el.querySelectorAll<HTMLButtonElement>('[data-related]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.dataset['related'];
        if (url) this.onSelectGame(url);
      });
    });

    this.animateExpOnScroll();
  }

  /** セクションが見えたら EXP バーを伸ばす */
  private animateExpOnScroll(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.el.querySelectorAll<HTMLElement>('.skill-card__exp-fill').forEach((fill) => {
            fill.style.width = fill.dataset['value'] ?? '0%';
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(this.el);
  }
}

/** 折りたたみ可能なグループ。見出しがトグルで、閉じている間はカードを描画したまま隠す */
function group(
  id: string,
  label: string,
  skills: readonly Skill[],
  titleOf: (url: string) => string,
  openByDefault: boolean,
): string {
  if (skills.length === 0) return '';
  const panelId = `skills-panel-${id}`;
  return `
    <div class="skills__section${openByDefault ? ' skills__section--open' : ''}">
      <h3 class="skills__group">
        <button class="skills__group-toggle" data-group-toggle aria-expanded="${openByDefault}" aria-controls="${panelId}">
          <span class="skills__group-label">${esc(label)}</span>
          <span class="skills__group-count">${String(skills.length).padStart(2, '0')}</span>
          <span class="skills__group-chevron" aria-hidden="true">▾</span>
        </button>
      </h3>
      <ul class="skills__grid" id="${panelId}">
        ${skills.map((s) => skillCard(s, titleOf)).join('')}
      </ul>
    </div>`;
}

function skillCard(skill: Skill, titleOf: (url: string) => string): string {
  const percent = Math.min(100, (skill.months / EXP_FULL_MONTHS) * 100);
  const hasDetail = skill.items.length > 0 || skill.relatedGames.length > 0;

  return `
    <li class="skill-card">
      <div class="skill-card__head">
        ${skillIcon(skill.name)}
        <h4 class="skill-card__name">${esc(skill.name)}</h4>
        <span class="skill-card__level">Lv.${skill.level}</span>
      </div>
      <div class="skill-card__exp">
        <span class="skill-card__exp-fill" data-value="${percent}%"></span>
      </div>
      <p class="skill-card__meta">
        <span>${esc(formatExperience(skill.months))}</span>
        ${skill.projects ? `<span>${esc(skill.projects)}</span>` : ''}
      </p>
      ${
        hasDetail
          ? `
        <button class="skill-card__toggle" data-toggle aria-expanded="false">▸ ${esc(t('details'))}</button>
        <div class="skill-card__detail">
          ${skill.items.length > 0 ? `<ul class="skill-card__items">${skill.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
          ${
            skill.relatedGames.length > 0
              ? `<p class="skill-card__related-label">${esc(t('relatedWorks'))}</p>
                 <div class="skill-card__related">
                   ${skill.relatedGames
                     .map((url) => ({ url, title: titleOf(url) }))
                     .filter((g) => g.title !== '')
                     .map(
                       (g) =>
                         `<button class="skill-card__related-btn" data-related="${esc(g.url)}">▸ ${esc(g.title)}</button>`,
                     )
                     .join('')}
                 </div>`
              : ''
          }
        </div>`
          : ''
      }
    </li>`;
}
