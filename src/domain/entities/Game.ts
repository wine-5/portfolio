/** projects.json の category 実値に合わせる */
export type GameCategory = 'game' | 'web' | 'web-game';

/** 配信ストア。バッジ表示に使う */
export type Store = 'app-store' | 'steam';

export type ReleaseState =
  | { kind: 'playable'; url: string; store?: Store }
  /** url はストアの商品ページ(公開前でもウィッシュリスト等に誘導できる) */
  | { kind: 'coming-soon'; store?: Store; url?: string }
  | { kind: 'archived' };

/** 看板作品セクションに並べる訴求ポイント(見出し + 補足の 2 行組) */
export interface Highlight {
  readonly title: string;
  readonly body: string;
}

/** 図鑑に載る 1 作品。No. は図鑑上の通し番号 */
export interface Game {
  readonly entryNo: number;
  readonly title: string;
  readonly description: string;
  readonly detailedFeatures: string;
  readonly myResponsibilities: string;
  readonly technologies: readonly string[];
  readonly supportedPlatforms: readonly string[];
  readonly images: readonly string[];
  readonly thumbnailImage: string;
  /** ホーム画面のカルーセル用アイコン(指定がなければ thumbnailImage を使う) */
  readonly carouselImage?: string;
  readonly githubUrl?: string;
  /** ダウンロード／配布ページへのリンク(ある作品だけ表示) */
  readonly downloadUrl?: string;
  readonly year: string;
  readonly category: GameCategory;
  readonly teamSize: string;
  readonly period: string;
  readonly release: ReleaseState;
  readonly featured: boolean;
  /**
   * 看板作品。図鑑とは別に、最上部の FLAGSHIP セクションで 1 作品だけ別格表示する。
   * FEATURED(ストア公開済み)とは軸が違うので枠を分けている
   */
  readonly flagship: boolean;
  /** FLAGSHIP セクションに並べる訴求ポイント(看板作品以外は空) */
  readonly highlights: readonly Highlight[];
  /** FLAGSHIP セクションで自動再生するループ動画(未指定なら images の動画を手動再生) */
  readonly flagshipVideo?: string;
  /** 受賞歴(あればカード右上にバッジ表示) */
  readonly award?: string;
}

/**
 * teamSize の先頭の人数を読む(全ロケールとも「7人（…）」「7 people (…)」の数字始まり)。
 * 数字始まりでないデータが来たら undefined を返し、バッジ表示側でスキップする
 */
export function teamHeadcount(game: Game): number | undefined {
  const m = /^\d+/.exec(game.teamSize.trim());
  return m ? Number(m[0]) : undefined;
}
