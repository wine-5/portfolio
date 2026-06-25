import type { CodexEntryVM } from '@application/index';
import { root } from '@app/composition-root';
import { GameDetailModal } from '../../GameDetailModal';

/**
 * ゲーム一覧: 制作したゲームの詳細リスト。
 */
export class GameList {
  private sortBy: 'date-desc' | 'date-asc' = 'date-desc';
  private filterBy: 'all' | string = 'all';

  constructor(private entries: CodexEntryVM[]) {}

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'game-list';

    // ヘッダー（タイトル + ソート）
    const header = document.createElement('div');
    header.className = 'game-list__header';

    const title = document.createElement('h3');
    title.className = 'game-list__title';
    title.textContent = `▸ 制作ゲーム一覧 (${this.entries.length})`;
    header.appendChild(title);

    // コントロール
    const controls = document.createElement('div');
    controls.className = 'game-list__controls';

    // フィルター
    const filterDiv = document.createElement('div');
    filterDiv.className = 'game-list__filter';

    const filterLabel = document.createElement('label');
    filterLabel.className = 'game-list__label';
    filterLabel.textContent = 'フィルター: ';

    const filterSelect = document.createElement('select');
    filterSelect.className = 'game-list__select';

    // カテゴリを収集
    const categories = new Set(this.entries.map(e => e.category));
    filterSelect.innerHTML = '<option value="all">すべて</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      filterSelect.appendChild(opt);
    });

    filterSelect.addEventListener('change', (e) => {
      this.filterBy = (e.target as HTMLSelectElement).value;
      this.updateList(list);
    });

    filterLabel.appendChild(filterSelect);
    filterDiv.appendChild(filterLabel);
    controls.appendChild(filterDiv);

    // ソート
    const sortDiv = document.createElement('div');
    sortDiv.className = 'game-list__sort';

    const sortLabel = document.createElement('label');
    sortLabel.className = 'game-list__label';
    sortLabel.textContent = 'ソート: ';

    const sortSelect = document.createElement('select');
    sortSelect.className = 'game-list__select';
    sortSelect.innerHTML = `
      <option value="date-desc">新しい順</option>
      <option value="date-asc">古い順</option>
    `;
    sortSelect.addEventListener('change', (e) => {
      this.sortBy = (e.target as HTMLSelectElement).value as typeof this.sortBy;
      this.updateList(list);
    });

    sortLabel.appendChild(sortSelect);
    sortDiv.appendChild(sortLabel);
    controls.appendChild(sortDiv);

    header.appendChild(controls);

    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'game-list__items';

    // ソート済みのエントリーを取得して表示
    this.updateList(list);

    container.appendChild(list);
    return container;
  }

  private updateList(list: HTMLElement): void {
    // リスト内容をクリア
    list.innerHTML = '';

    const sortedEntries = this.getSortedEntries();

    sortedEntries.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'game-list-item';
      item.style.cursor = 'pointer';

      // サムネイル
      const thumbnail = document.createElement('img');
      thumbnail.src = entry.thumbnailUrl;
      thumbnail.alt = entry.title;
      thumbnail.className = 'game-list-item__thumb';

      // 情報エリア
      const info = document.createElement('div');
      info.className = 'game-list-item__info';

      // タイトル + 説明
      const header = document.createElement('div');
      header.className = 'game-list-item__header';

      const titleEl = document.createElement('h4');
      titleEl.className = 'game-list-item__title';
      titleEl.textContent = entry.title;
      header.appendChild(titleEl);

      const desc = document.createElement('p');
      desc.className = 'game-list-item__desc';
      desc.textContent = entry.description;
      header.appendChild(desc);

      info.appendChild(header);

      // メタ情報（テクノロジー、カテゴリなど）
      const meta = document.createElement('div');
      meta.className = 'game-list-item__meta';

      const category = document.createElement('span');
      category.className = 'game-list-item__category';
      category.textContent = entry.category;

      meta.appendChild(category);

      if (entry.featured) {
        const badge = document.createElement('span');
        badge.className = 'game-list-item__badge';
        badge.textContent = entry.featuredBadge || '公開済み';
        meta.appendChild(badge);
      }

      info.appendChild(meta);

      // アクションボタン
      const actions = document.createElement('div');
      actions.className = 'game-list-item__actions';

      if (entry.installUrl) {
        const playBtn = document.createElement('a');
        playBtn.href = entry.installUrl;
        playBtn.target = '_blank';
        playBtn.className = 'btn btn--play';
        playBtn.textContent = '▸ プレイ';
        actions.appendChild(playBtn);
      }

      const detailBtn = document.createElement('button');
      detailBtn.className = 'btn btn--details';
      detailBtn.textContent = '詳細を見る';
      detailBtn.addEventListener('click', async () => {
        const detail = await root.getGameDetail.execute(entry.id, 'ja');
        if (detail) {
          const modal = new GameDetailModal(detail);
          modal.show();
        }
      });
      actions.appendChild(detailBtn);

      info.appendChild(actions);
      item.appendChild(thumbnail);
      item.appendChild(info);
      list.appendChild(item);
    });
  }

  private getSortedEntries(): CodexEntryVM[] {
    // フィルター
    let entries = this.entries.filter(entry => {
      if (this.filterBy === 'all') return true;
      return entry.category === this.filterBy;
    });

    // ソート: CodexNoでソート（数字を抽出）
    entries = [...entries].sort((a, b) => {
      const numA = parseInt(a.codexNo.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.codexNo.replace(/\D/g, '')) || 0;

      if (this.sortBy === 'date-desc') {
        return numB - numA;
      } else {
        return numA - numB;
      }
    });

    return entries;
  }
}

/**
 * GameList CSS。
 */
export const GAME_LIST_STYLES = `
.game-list {
  margin-bottom: var(--space-12);
}

.game-list__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  border-bottom: 2px solid var(--line);
  padding-bottom: var(--space-3);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.game-list__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--accent);
  margin: 0;
  flex: 1;
}

.game-list__controls {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.game-list__filter,
.game-list__sort {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.game-list__label {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--ink);
  white-space: nowrap;
}

.game-list__select {
  padding: var(--space-1) var(--space-2);
  border: 2px solid var(--line);
  background: var(--bg-1);
  color: var(--ink);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  cursor: pointer;
  border-radius: 0;
  min-width: 120px;
}

.game-list__select:focus {
  outline: none;
  border-color: var(--accent);
}

.game-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.game-list-item {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--space-4);
  border: 2px solid var(--line);
  background: var(--bg-window);
  padding: var(--space-4);
  transition: all 200ms ease-out;
  box-shadow: var(--window-shadow);
}

.game-list-item:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px var(--accent);
  transform: translateX(2px);
}

.game-list-item__thumb {
  width: 160px;
  height: 160px;
  object-fit: cover;
  image-rendering: pixelated;
  border: 2px solid var(--line);
}

.game-list-item__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  justify-content: space-between;
}

.game-list-item__header {
  flex: 1;
}

.game-list-item__title {
  font-family: var(--font-pixel);
  font-size: var(--fs-lg);
  color: var(--accent);
  margin: 0 0 var(--space-2) 0;
}

.game-list-item__desc {
  font-size: var(--fs-sm);
  color: var(--ink);
  margin: 0;
  line-height: 1.6;
}

.game-list-item__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  align-items: center;
}

.game-list-item__category {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--line-soft);
  background: var(--bg-1);
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  color: var(--ink-dim);
  border-radius: 2px;
}

.game-list-item__badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--c-legendary);
  color: var(--bg-primary);
  font-family: var(--font-pixel);
  font-size: var(--fs-xs);
  border: 1px solid var(--c-gold);
  border-radius: 2px;
}

.game-list-item__actions {
  display: flex;
  gap: var(--space-2);
}

.btn--play {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--c-exp);
  background: var(--bg-1);
  color: var(--c-exp);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 150ms;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn--play:hover {
  background: var(--c-exp);
  color: var(--bg-primary);
}

.btn--details {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--accent);
  background: var(--bg-1);
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 150ms;
}

.btn--details:hover {
  background: var(--accent);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .game-list-item {
    grid-template-columns: 120px 1fr;
  }

  .game-list-item__thumb {
    width: 120px;
    height: 120px;
  }

  .game-list-item__title {
    font-size: var(--fs-base);
  }

  .game-list-item__desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .game-list-item {
    grid-template-columns: 100px 1fr;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .game-list-item__thumb {
    width: 100px;
    height: 100px;
  }

  .game-list-item__actions {
    flex-direction: column;
  }
}
`;
