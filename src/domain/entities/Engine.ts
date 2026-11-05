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
 * 「AI がエンジンを操作する流れ」の 1 段。
 * 画像(src)か、依頼の文面(prompt)のどちらか 1 つを見せる。prompt は実画面ではなく依頼の例なので promptNote で例だと断る
 */
export interface EngineStep {
  readonly label: string;
  readonly title: string;
  /** この段で使うアプリ(ChatGPT / Claude デスクトップ、WineEngine など) */
  readonly app: string;
  readonly caption: string;
  readonly src?: string;
  readonly prompt?: string;
  readonly promptNote?: string;
}

/** 見出し付きの画像 1 枚(AI の操作履歴など) */
export interface EngineTitledFigure extends EngineFigure {
  readonly title: string;
}

/** 補足の枠(見出し + 本文) */
export interface EngineNote {
  readonly title: string;
  readonly body: string;
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
  /** エンジンの狙い(短い一言を並べる) */
  readonly concepts: readonly string[];
  readonly summary: string;
  /** AI がエンジンを操作する流れ(STEP 1〜3) */
  readonly steps: readonly EngineStep[];
  /** AI が使ったコマンドの履歴の画像 */
  readonly history: EngineTitledFigure | undefined;
  /** 他の人にも配って使ってもらっていること */
  readonly shared: EngineNote | undefined;
  readonly pillars: readonly EnginePillar[];
  readonly tags: readonly string[];
  readonly figures: readonly EngineFigure[];
  readonly works: readonly string[];
}
