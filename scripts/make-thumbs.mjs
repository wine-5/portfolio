/**
 * 作品カード・カルーセル・ギャラリーのサムネイル用の縮小画像(images/thumbs/ 配下の webp)を作る。
 * 元の画像は 1 枚で数 MB あり、一覧に並べるたびに展開が重くスクロールがカクつくため、
 * 一覧では縮小版を使い、詳細モーダルの大きな表示でだけ元画像を出す。
 *
 * 使い方: npm run thumbs (ffmpeg が必要。作品を追加・画像を差し替えたら実行する)
 * 既に縮小版があり、元画像より新しければ作り直さない。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/** 一覧カード・ギャラリーのサムネイルは最大 640px、カルーセルのアイコンは最大 320px あれば足りる */
const SIZES = { thumbnailImage: 640, carouselImage: 320, images: 640 };

/** GIF はアニメーションを残したいので、動画は画像ではないので対象外 */
const RESIZABLE = /\.(png|jpe?g|webp)$/i;

const projects = JSON.parse(readFileSync('public/data/locales/ja/projects.json', 'utf8'));
let made = 0;

for (const project of projects) {
  for (const [key, size] of Object.entries(SIZES)) {
    for (const src of [project[key]].flat()) {
      if (!src || !RESIZABLE.test(src)) continue;
      const out = src.replace(/^images\//, 'images/thumbs/').replace(RESIZABLE, '.webp');
      if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;

      mkdirSync(path.dirname(out), { recursive: true });
      execFileSync('ffmpeg', [
        '-loglevel', 'error', '-y', '-i', src,
        '-frames:v', '1',
        '-vf', `scale='min(${size},iw)':'min(${size},ih)':force_original_aspect_ratio=decrease`,
        '-quality', '80', out,
      ]);
      made++;
      console.log(`${src} -> ${out}`);
    }
  }
}

console.log(made === 0 ? 'thumbs: すべて最新です' : `thumbs: ${made} 枚作りました`);
