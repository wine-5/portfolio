import { CyberBackground } from '../components/CyberBackground';
import { supportsWebGL } from '../util/webgl';
import type { BackgroundKind } from './backgroundPreference';

interface Background {
  start(parent: HTMLElement): void;
  stop(): void;
}

let current: Background | null = null;
let currentKind: BackgroundKind | null = null;
/** 読み込み中に別の背景が選ばれたとき、古い読み込み結果を捨てるための世代番号 */
let generation = 0;

/**
 * 背景を切り替える(body 直下に置き、言語切り替えの再描画に巻き込まれないようにする)。
 * depth は WebGL が使えれば Three.js の奥行き背景、使えなければ 2D Canvas の背景にする。
 * Three.js は重いので、初期表示を妨げないよう遅延読み込みする
 */
export async function showBackground(kind: BackgroundKind): Promise<void> {
  if (kind === currentKind) return;
  currentKind = kind;
  const gen = ++generation;

  let next: Background = new CyberBackground();
  if (kind === 'depth' && supportsWebGL()) {
    try {
      const { DepthBackground } = await import('../components/DepthBackground');
      next = new DepthBackground();
    } catch {
      // 読み込みに失敗したら 2D 背景のまま
    }
  }
  if (gen !== generation) return;

  current?.stop();
  current = next;
  current.start(document.body);
}
