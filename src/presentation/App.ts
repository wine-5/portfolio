import type { GetGameCollection } from '@application/usecases/GetGameCollection';
import type { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import type { GetNews } from '@application/usecases/GetNews';
import type { Locale } from '@application/ports/Locale';
import { BootScreen } from './components/BootScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { GamesSection } from './sections/GamesSection';
import { NewsSection } from './sections/NewsSection';
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
    private readonly getNews: GetNews,
  ) {}

  async start(locale: Locale): Promise<void> {
    const boot = new BootScreen().play(this.root);
    const [collection, profile, news] = await Promise.all([
      this.getGameCollection.execute(locale),
      this.getPlayerProfile.execute(locale),
      this.getNews.execute(locale),
    ]);
    await boot;

    const header = new Header();
    header.render();
    header.mount(this.root);

    const main = document.createElement('main');
    main.className = 'app';
    this.root.appendChild(main);

    const games = new GamesSection();
    games.render(collection);

    const hero = new HeroSection();
    hero.setOnSelect((entryNo) => games.focusEntry(entryNo));
    hero.render([...collection.featured, ...collection.entries]);
    hero.mount(main);

    games.mount(main);

    const newsSection = new NewsSection();
    newsSection.render(news);
    newsSection.mount(main);

    const about = new AboutSection();
    about.render(profile);
    about.mount(main);

    const footer = new Footer();
    footer.render({ social: profile.links });
    footer.mount(this.root);
  }
}
