import type { GetGameCollection } from '@application/usecases/GetGameCollection';
import type { GetPlayerSkills } from '@application/usecases/GetPlayerSkills';
import type { Locale } from '@application/ports/Locale';
import { BootScreen } from './components/BootScreen';

/**
 * アプリ全体のシェル。
 * 現段階は基盤検証用の仮描画(図鑑・Skills の中身はフェーズ 3 以降で実装)。
 */
export class App {
  constructor(
    private readonly root: HTMLElement,
    private readonly getGameCollection: GetGameCollection,
    private readonly getPlayerSkills: GetPlayerSkills,
  ) {}

  async start(locale: Locale): Promise<void> {
    await new BootScreen().play(this.root);

    const [collection, skills] = await Promise.all([
      this.getGameCollection.execute(locale),
      this.getPlayerSkills.execute(locale),
    ]);

    // 仮描画: パイプライン(JSON→Domain→UseCase→View)の疎通確認
    const main = document.createElement('main');
    main.className = 'app';
    main.innerHTML = `
      <h1>ずかん(仮)</h1>
      <p>FEATURED: ${collection.featured.map((g) => g.title).join(' / ')}</p>
      <ol>
        ${collection.entries
          .map((g) => `<li>No.${String(g.entryNo).padStart(3, '0')} ${g.title} (ATK ${g.stats.atk})</li>`)
          .join('')}
      </ol>
      <h2>スキル(仮)</h2>
      <ul>
        ${skills.map((s) => `<li>${s.title} Lv.${s.level}</li>`).join('')}
      </ul>
    `;
    this.root.appendChild(main);
  }
}
