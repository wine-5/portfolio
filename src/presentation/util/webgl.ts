/** WebGL が使えるか(使えなければ呼び出し側で 2D 背景にフォールバックする) */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
