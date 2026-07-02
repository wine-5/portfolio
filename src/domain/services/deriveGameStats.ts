import type { GameStats } from '../values/GameStats';
import { clampStat } from '../values/GameStats';

/**
 * 既存 JSON を汚さず、作品データからステータスを決定論的に導出する。
 * 同じ入力からは常に同じ値が出る(乱数不使用)。
 * - ATK: 実装ボリューム感(説明・担当範囲の情報量)
 * - DEF: 対応プラットフォーム数と開発期間
 * - INT: 使用技術数
 * - AGI: 開発期間の短さ(ジャム系ほど高い)
 * - LUK: タイトル文字列からのハッシュ(遊び)
 */
export function deriveGameStats(input: {
  title: string;
  detailedFeatures: string;
  myResponsibilities: string;
  technologies: readonly string[];
  supportedPlatforms: readonly string[];
  period: string;
}): GameStats {
  const periodDays = parsePeriodDays(input.period);

  const atk = clampStat(
    30 + input.detailedFeatures.length / 8 + input.myResponsibilities.length / 6,
  );
  const def = clampStat(25 + input.supportedPlatforms.length * 15 + Math.min(periodDays, 60));
  const int = clampStat(20 + input.technologies.length * 18);
  const agi = clampStat(periodDays <= 3 ? 90 - periodDays * 5 : 70 - Math.min(periodDays, 60));
  const luk = clampStat((hashString(input.title) % 80) + 20);

  return { atk, def, int, agi, luk };
}

/** "2日間" "1週間" "3ヶ月" 等のゆるい日本語表記を日数に変換(不明なら 14) */
function parsePeriodDays(period: string): number {
  const m = period.match(/(\d+)\s*(日|週間|ヶ月|か月|カ月|年)/);
  if (!m) return 14;
  const n = Number(m[1]);
  switch (m[2]) {
    case '日':
      return n;
    case '週間':
      return n * 7;
    case '年':
      return n * 365;
    default:
      return n * 30;
  }
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
