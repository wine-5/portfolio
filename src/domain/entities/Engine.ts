/** エンジンの特徴 1 つ(見出し + 補足) */
export interface EnginePillar {
  readonly title: string;
  readonly body: string;
}

/** エンジンの画面写真 1 枚 */
export interface EngineFigure {
  readonly src: string;
  readonly caption: string;
}

/**
 * 自作ゲームエンジン(WineEngine)の紹介 1 件。
 * works はこのエンジンで作った作品の ID で、作品の画像パス(images/game/<id>/...)から作品を引く
 */
export interface Engine {
  readonly name: string;
  /** 開発状況の表示(「現在開発中」など) */
  readonly status: string;
  /** エンジンのモットー。セクションの最も目立つ位置に大きく出す */
  readonly motto: string;
  readonly tagline: string;
  readonly summary: string;
  readonly pillars: readonly EnginePillar[];
  readonly tags: readonly string[];
  readonly figures: readonly EngineFigure[];
  readonly works: readonly string[];
}
