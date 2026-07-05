/**
 * アンカーリンク(href="#...")のクリック時に、ページを加速度付きでスムーズにスクロールさせる。
 * - クリック時のデフォルト動作を抑止
 * - easeOutCubic でリアルな加速度感を演出
 * - 通常は 600ms で移動完了、prefers-reduced-motion 時は即座に移動
 */

const SCROLL_DURATION_MS = 600;

/**
 * イージング関数: easeOutCubic
 * 最初は速く、終わりに向かって減速
 * @param t 0-1 の進捗度
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function setupSmoothScroll(): void {
  // アンカーリンク(href="#...")のクリックを監視
  document.addEventListener('click', (e) => {
    const target = (e.target as Element).closest('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href === '#') return;

    const sectionId = href.slice(1); // "#games" → "games"
    const section = document.getElementById(sectionId);
    if (!section) return;

    e.preventDefault();

    // prefers-reduced-motion 時は即座にジャンプ
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.scrollIntoView();
      return;
    }

    scrollToElement(section);
  });
}

function scrollToElement(element: Element): void {
  const startTop = window.scrollY;
  const targetTop = element.getBoundingClientRect().top + window.scrollY;
  const distance = targetTop - startTop;

  // 既に表示されている場合はスクロール不要
  if (Math.abs(distance) < 1) return;

  const startTime = performance.now();

  const animate = (currentTime: number): void => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1);
    const easeProgress = easeOutCubic(progress);

    window.scrollTo(0, startTop + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}
