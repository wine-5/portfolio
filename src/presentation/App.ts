import type { GetGameCollection } from '@application/usecases/GetGameCollection';
import type { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import type { Locale } from '@application/ports/Locale';
import { BootScreen } from './components/BootScreen';
import { GamesSection } from './sections/GamesSection';
import { AboutSection } from './sections/AboutSection';

/**
 * アプリ全体のシェル。
 * セクションは仕様の主役順に追加していく(Games → About → Skills → Contact)。
 */
export class App {
  constructor(
    private readonly root: HTMLElement,
    private readonly getGameCollection: GetGameCollection,
    private readonly getPlayerProfile: GetPlayerProfile,
  ) {}

  async start(locale: Locale): Promise<void> {
    const boot = new BootScreen().play(this.root);
    const [collection, profile] = await Promise.all([
      this.getGameCollection.execute(locale),
      this.getPlayerProfile.execute(locale),
    ]);
    await boot;

    this.root.insertAdjacentHTML(
      'afterbegin',
      `<header class="hud">
        <span class="hud__logo">WINE-5</span>
        <nav class="hud__nav">
          <a href="#games">GAMES</a>
          <a href="#about">ABOUT</a>
        </nav>
      </header>`,
    );

    const main = document.createElement('main');
    main.className = 'app';
    this.root.appendChild(main);

    const games = new GamesSection();
    games.render(collection);
    games.mount(main);

    const about = new AboutSection();
    about.render(profile);
    about.mount(main);
  }
}
