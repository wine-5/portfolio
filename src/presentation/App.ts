import type { GetGameCollection, GameCollection } from '@application/usecases/GetGameCollection';
import type { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import type { GetPlayerSkills, SkillMatrix } from '@application/usecases/GetPlayerSkills';
import type { GetNews } from '@application/usecases/GetNews';
import type { Locale } from '@application/ports/Locale';
import type { Profile } from '@domain/entities/Profile';
import type { NewsItem } from '@domain/entities/NewsItem';
import { BootScreen } from './components/BootScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { FlagshipSection } from './sections/FlagshipSection';
import { GamesSection } from './sections/GamesSection';
import { SkillsSection } from './sections/SkillsSection';
import { NewsSection } from './sections/NewsSection';
import { AboutSection } from './sections/AboutSection';
import { setUiLocale } from './i18n/uiStrings';
import { persistLocale } from './i18n/localePreference';
import './styles/transition.css';

interface AppData {
  readonly collection: GameCollection;
  readonly profile: Profile;
  readonly skills: SkillMatrix;
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
    private readonly getPlayerSkills: GetPlayerSkills,
    private readonly getNews: GetNews,
  ) {}

  async start(locale: Locale): Promise<void> {
    const boot = new BootScreen().play(this.root);
    const data = await this.load(locale);
    await boot;
    this.renderAll(locale, data);
  }

  /** 言語切り替え時はブート画面なしで、短いトランジション演出を挟んで描画し直す */
  private async switchLocale(locale: Locale): Promise<void> {
    persistLocale(locale);
    const data = await this.load(locale);
    await this.transitionSwap(() => {
      this.root.innerHTML = '';
      this.renderAll(locale, data);
    });
  }

  /** 画面全体をスキャンライン付きオーバーレイで一瞬覆い、隠れている間に中身を差し替える */
  private transitionSwap(swap: () => void): Promise<void> {
    const overlay = document.createElement('div');
    overlay.className = 'locale-transition';
    document.body.appendChild(overlay);
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        overlay.classList.add('locale-transition--cover');
        window.setTimeout(() => {
          swap();
          overlay.classList.remove('locale-transition--cover');
          window.setTimeout(() => {
            overlay.remove();
            resolve();
          }, 260);
        }, 240);
      });
    });
  }

  private async load(locale: Locale): Promise<AppData> {
    const [collection, profile, skills, news] = await Promise.all([
      this.getGameCollection.execute(locale),
      this.getPlayerProfile.execute(locale),
      this.getPlayerSkills.execute(locale),
      this.getNews.execute(locale),
    ]);
    return { collection, profile, skills, news };
  }

  private renderAll(locale: Locale, { collection, profile, skills, news }: AppData): void {
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

    const flagshipGame = collection.flagship;
    const flagship = flagshipGame ? new FlagshipSection() : null;

    // 看板作品は図鑑グリッドに並ばないので、専用セクションへスクロールさせる
    const focusEntry = (entryNo: number): void => {
      if (flagship && flagshipGame?.entryNo === entryNo) flagship.focus();
      else games.focusEntry(entryNo);
    };

    // カルーセルは看板作品を先頭に置く(角度 0 = 正面なので初期表示で正面に来る)
    const allGames = [
      ...(flagshipGame ? [flagshipGame] : []),
      ...collection.featured,
      ...collection.entries,
    ];

    const hero = new HeroSection();
    hero.setOnSelect(focusEntry);
    hero.render(allGames);
    hero.mount(main);

    // 看板作品はリリース作品(FEATURED)の下、図鑑グリッドの上に置く
    if (flagship && flagshipGame) {
      flagship.render(flagshipGame);
      games.mountFlagship(flagship);
    }

    games.mount(main);

    // githubUrl から作品を引く(Skills/News からのジャンプに共用)
    const focusByGithubUrl = (githubUrl: string): void => {
      const game = allGames.find((g) => g.githubUrl === githubUrl);
      if (game) focusEntry(game.entryNo);
    };

    const skillsSection = new SkillsSection();
    skillsSection.setOnSelectGame(focusByGithubUrl);
    skillsSection.setGameTitleResolver(
      (githubUrl) => allGames.find((g) => g.githubUrl === githubUrl)?.title ?? '',
    );
    skillsSection.render(skills);
    skillsSection.mount(main);

    const about = new AboutSection();
    about.render(profile);
    about.mount(main);

    const newsSection = new NewsSection();
    // ニュースからも図鑑カードへ移動できるようにする(ヒーローのアイコンタップと同じ挙動)
    newsSection.setOnSelectGame(focusByGithubUrl);
    newsSection.render(news);
    newsSection.mount(main);

    const footer = new Footer();
    footer.render({ social: profile.links });
    footer.mount(this.root);
  }
}
