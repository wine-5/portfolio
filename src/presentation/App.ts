import type { GetGameCollection, GameCollection } from '@application/usecases/GetGameCollection';
import type { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import type { GetNews } from '@application/usecases/GetNews';
import type { Locale } from '@application/ports/Locale';
import type { Profile } from '@domain/entities/Profile';
import type { NewsItem } from '@domain/entities/NewsItem';
import { BootScreen } from './components/BootScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { GamesSection } from './sections/GamesSection';
import { NewsSection } from './sections/NewsSection';
import { AboutSection } from './sections/AboutSection';
import { setUiLocale } from './i18n/uiStrings';
import { persistLocale } from './i18n/localePreference';

interface AppData {
  readonly collection: GameCollection;
  readonly profile: Profile;
  readonly news: readonly NewsItem[];
}

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
    const data = await this.load(locale);
    await boot;
    this.renderAll(locale, data);
  }

  /** 言語切り替え時はブート画面なしで全体を描画し直す */
  private async switchLocale(locale: Locale): Promise<void> {
    persistLocale(locale);
    const data = await this.load(locale);
    this.root.innerHTML = '';
    this.renderAll(locale, data);
  }

  private async load(locale: Locale): Promise<AppData> {
    const [collection, profile, news] = await Promise.all([
      this.getGameCollection.execute(locale),
      this.getPlayerProfile.execute(locale),
      this.getNews.execute(locale),
    ]);
    return { collection, profile, news };
  }

  private renderAll(locale: Locale, { collection, profile, news }: AppData): void {
    setUiLocale(locale);
    document.documentElement.lang = locale;

    const header = new Header();
    header.render({ locale, onLocaleChange: (next) => void this.switchLocale(next) });
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
