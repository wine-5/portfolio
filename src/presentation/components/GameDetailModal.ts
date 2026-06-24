import type { GameDetailVM } from '@application/index';

/**
 * ゲーム詳細モーダル: ゲームをクリックしたときの詳細表示。
 */
export class GameDetailModal {
  private modal: HTMLElement | null = null;

  constructor(private detail: GameDetailVM) {}

  show(): void {
    if (this.modal) {
      this.modal.style.display = 'flex';
      return;
    }

    this.modal = this.createModal();
    document.body.appendChild(this.modal);
  }

  hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  private createModal(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'game-detail-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'game-detail-modal';

    // クローズボタン
    const closeBtn = document.createElement('button');
    closeBtn.className = 'game-detail-modal__close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.hide());
    modal.appendChild(closeBtn);

    // コンテンツ
    const content = document.createElement('div');
    content.className = 'game-detail-modal__content';

    // 画像ギャラリー
    if (this.detail.imageUrls.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'game-detail-gallery';

      const mainImg = document.createElement('img');
      mainImg.src = this.detail.imageUrls[0];
      mainImg.alt = this.detail.title;
      mainImg.className = 'game-detail-gallery__main';
      gallery.appendChild(mainImg);

      if (this.detail.imageUrls.length > 1) {
        const thumbs = document.createElement('div');
        thumbs.className = 'game-detail-gallery__thumbs';

        this.detail.imageUrls.forEach((img: string) => {
          const thumb = document.createElement('img');
          thumb.src = img;
          thumb.alt = this.detail.title;
          thumb.className = 'game-detail-gallery__thumb';
          thumb.addEventListener('click', () => {
            mainImg.src = img;
          });
          thumbs.appendChild(thumb);
        });

        gallery.appendChild(thumbs);
      }

      content.appendChild(gallery);
    }

    // 情報パネル
    const info = document.createElement('div');
    info.className = 'game-detail-info';

    // タイトル
    const title = document.createElement('h2');
    title.className = 'game-detail-info__title';
    title.textContent = this.detail.title;
    info.appendChild(title);

    // バッジ
    if (this.detail.featuredBadge) {
      const badge = document.createElement('span');
      badge.className = 'game-detail-info__badge';
      badge.textContent = this.detail.featuredBadge;
      info.appendChild(badge);
    }

    // 説明
    const description = document.createElement('p');
    description.className = 'game-detail-info__desc';
    description.textContent = this.detail.description;
    info.appendChild(description);

    // ゲームスタット
    if (this.detail.stat) {
      const stats = document.createElement('div');
      stats.className = 'game-detail-stats';

      const statLabels = [
        { label: '難易度', value: this.detail.stat.difficulty },
        { label: '独創性', value: this.detail.stat.novelty },
        { label: 'クオリティ', value: this.detail.stat.quality },
      ];

      statLabels.forEach(({ label, value }) => {
        const stat = document.createElement('div');
        stat.className = 'game-detail-stat';

        const statLabel = document.createElement('span');
        statLabel.className = 'game-detail-stat__label';
        statLabel.textContent = label;
        stat.appendChild(statLabel);

        const statBar = document.createElement('div');
        statBar.className = 'game-detail-stat__bar';
        const fill = document.createElement('div');
        fill.className = 'game-detail-stat__fill';
        fill.style.width = `${(value / 5) * 100}%`;
        statBar.appendChild(fill);
        stat.appendChild(statBar);

        const statValue = document.createElement('span');
        statValue.className = 'game-detail-stat__value';
        statValue.textContent = `${value}/5`;
        stat.appendChild(statValue);

        stats.appendChild(stat);
      });

      info.appendChild(stats);
    }

    // テクノロジー
    if (this.detail.technologies.length > 0) {
      const techSection = document.createElement('div');
      techSection.className = 'game-detail-section';

      const techLabel = document.createElement('h4');
      techLabel.className = 'game-detail-section__label';
      techLabel.textContent = '使用技術';
      techSection.appendChild(techLabel);

      const techList = document.createElement('div');
      techList.className = 'game-detail-tech-list';

      this.detail.technologies.forEach((tech) => {
        const tag = document.createElement('span');
        tag.className = 'game-detail-tech-tag';
        tag.textContent = tech;
        techList.appendChild(tag);
      });

      techSection.appendChild(techList);
      info.appendChild(techSection);
    }

    // 担当
    if (this.detail.myResponsibilities) {
      const respSection = document.createElement('div');
      respSection.className = 'game-detail-section';

      const respLabel = document.createElement('h4');
      respLabel.className = 'game-detail-section__label';
      respLabel.textContent = '担当範囲';
      respSection.appendChild(respLabel);

      const respText = document.createElement('p');
      respText.className = 'game-detail-section__text';
      respText.textContent = this.detail.myResponsibilities;
      respSection.appendChild(respText);

      info.appendChild(respSection);
    }

    // リンク
    const links = document.createElement('div');
    links.className = 'game-detail-links';

    if (this.detail.installUrl) {
      const playLink = document.createElement('a');
      playLink.href = this.detail.installUrl;
      playLink.target = '_blank';
      playLink.className = 'btn btn--primary';
      playLink.textContent = '▸ プレイする';
      links.appendChild(playLink);
    }

    if (this.detail.githubUrl) {
      const codeLink = document.createElement('a');
      codeLink.href = this.detail.githubUrl;
      codeLink.target = '_blank';
      codeLink.className = 'btn btn--secondary';
      codeLink.textContent = '▸ ソースコード';
      links.appendChild(codeLink);
    }

    info.appendChild(links);
    content.appendChild(info);
    modal.appendChild(content);

    // バックドロップをクリックしたらモーダルを閉じる
    backdrop.appendChild(modal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.hide();
      }
    });

    return backdrop;
  }
}

/**
 * GameDetailModal CSS。
 */
export const GAME_DETAIL_MODAL_STYLES = `
.game-detail-modal-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: var(--z-modal);
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.game-detail-modal {
  position: relative;
  background: var(--bg-window);
  border: 3px solid var(--line);
  border-radius: 0;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
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

.game-detail-modal__close {
  position: sticky;
  top: 0;
  right: 0;
  float: right;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 1.8rem;
  cursor: pointer;
  padding: var(--space-3);
  z-index: 1;
  transition: transform 150ms;
}

.game-detail-modal__close:hover {
  transform: scale(1.3);
}

.game-detail-modal__content {
  padding: var(--space-6);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.game-detail-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.game-detail-gallery__main {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  image-rendering: pixelated;
  border: 2px solid var(--line);
}

.game-detail-gallery__thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.game-detail-gallery__thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  image-rendering: pixelated;
  border: 2px solid var(--line);
  cursor: pointer;
  transition: all 150ms;
}

.game-detail-gallery__thumb:hover {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.game-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.game-detail-info__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-xl);
  color: var(--accent);
  margin: 0;
}

.game-detail-info__badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--c-legendary);
  color: var(--bg-primary);
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  width: fit-content;
}

.game-detail-info__desc {
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--ink);
  margin: 0;
}

.game-detail-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.game-detail-stat {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  gap: var(--space-2);
  align-items: center;
}

.game-detail-stat__label {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--ink);
}

.game-detail-stat__bar {
  height: 20px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  position: relative;
  overflow: hidden;
}

.game-detail-stat__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--c-magenta));
  transition: width 300ms ease-out;
}

.game-detail-stat__value {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--accent);
  text-align: right;
}

.game-detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.game-detail-section__label {
  font-family: var(--font-pixel);
  font-size: var(--fs-base);
  color: var(--accent);
  margin: 0;
}

.game-detail-section__text {
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--ink);
  margin: 0;
}

.game-detail-tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.game-detail-tech-tag {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--accent);
  background: var(--bg-1);
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
}

.game-detail-links {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.game-detail-links .btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  text-align: center;
}

@media (max-width: 768px) {
  .game-detail-modal__content {
    grid-template-columns: 1fr;
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .game-detail-gallery__thumbs {
    grid-template-columns: repeat(3, 1fr);
  }

  .game-detail-stat {
    grid-template-columns: 70px 1fr 40px;
    gap: var(--space-1);
  }
}
`;
