import { Component } from '../../core/Component';
import { root } from '@app/composition-root';
import { createExpBar } from '../ExpBar';
import type { SkillVM } from '@application/index';

/**
 * Skills セクション: 能力値・EXPバー風。
 */
export class SkillsSection extends Component {
  private skills: SkillVM[] = [];

  async initialize(): Promise<void> {
    const sheet = await root.getSkillSheet.execute('ja');
    this.skills = sheet.skills;
  }

  render(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'skills';
    section.className = 'skills-section section';

    const title = document.createElement('h2');
    title.className = 'section__title';
    title.textContent = '▸ SKILLS & ABILITIES';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'skills-grid';

    this.skills.forEach((skill) => {
      const card = document.createElement('div');
      card.className = 'skill-card';

      const skillName = document.createElement('h3');
      skillName.className = 'skill-card__name';
      skillName.textContent = skill.title;
      card.appendChild(skillName);

      const level = document.createElement('div');
      level.className = 'skill-card__level';
      level.textContent = `Lv. ${skill.level} / 48`;
      card.appendChild(level);

      const expBar = createExpBar(skill.experiencePercent, `${skill.experienceText}`);
      expBar.className = 'skill-card__exp';
      card.appendChild(expBar);

      if (skill.additionalSkills.length > 0) {
        const additional = document.createElement('div');
        additional.className = 'skill-card__additional';
        additional.innerHTML = `<strong>習得:</strong> ${skill.additionalSkills.join(', ')}`;
        card.appendChild(additional);
      }

      const projects = document.createElement('p');
      projects.className = 'skill-card__projects';
      projects.textContent = skill.projects;
      card.appendChild(projects);

      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }
}

/**
 * Skills Section CSS。
 */
export const SKILLS_SECTION_STYLES = `
.skills-section {
  background: var(--bg-1);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.skill-card {
  border: 2px solid var(--line);
  background: var(--bg-window);
  padding: var(--space-4);
  box-shadow: var(--window-shadow);
  transition: all 150ms;
}

.skill-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}

.skill-card__name {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--accent);
  margin: 0 0 var(--space-2) 0;
}

.skill-card__level {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  margin-bottom: var(--space-3);
}

.skill-card__exp {
  margin-bottom: var(--space-3);
}

.skill-card__additional {
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.skill-card__additional strong {
  color: var(--ink);
}

.skill-card__projects {
  font-size: 0.85rem;
  color: var(--ink-faint);
  margin: 0;
  font-style: italic;
}

@media (max-width: 640px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}
`;
