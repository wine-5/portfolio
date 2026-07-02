import { View } from './View';
import { esc, asset } from '../util/html';

export interface CarouselEntry {
  readonly entryNo: number;
  readonly title: string;
  readonly image: string;
}

/**
 * ゲームアイコンを 3D の円環状に並べて回すカルーセル(旧サイトの上部演出の再現)。
 * - 自動でゆっくり回転
 * - ドラッグ/スワイプで手動回転(操作後は数秒置いて自動回転を再開)
 * - 矢印ボタンで 1 つずつ送る
 * - アイコンクリックで onSelect(そのゲームの詳細を開く)
 */
export class GameCarousel extends View<readonly CarouselEntry[]> {
  private static readonly AUTO_SPEED = 9; // 度/秒
  private static readonly RESUME_DELAY_MS = 3000;

  private entries: readonly CarouselEntry[] = [];
  private items: HTMLElement[] = [];
  private stage: HTMLElement | null = null;
  private rotation = 0;
  private targetRotation: number | null = null;
  private dragging = false;
  private moved = false;
  private lastX = 0;
  private resumeAt = 0;
  private rafId = 0;
  private lastTime = 0;
  private radiusX = 350;
  private radiusZ = 170;
  private onSelect: (entryNo: number) => void = () => {};

  constructor() {
    super('div', 'carousel');
  }

  setOnSelect(fn: (entryNo: number) => void): void {
    this.onSelect = fn;
  }

  override render(entries: readonly CarouselEntry[]): void {
    this.entries = entries;
    this.el.innerHTML = `
      <div class="carousel__stage">
        ${entries
          .map(
            (e, i) => `
              <button class="carousel__item" data-index="${i}" aria-label="${esc(e.title)}">
                <img src="${asset(e.image)}" alt="" draggable="false" loading="lazy" />
              </button>`,
          )
          .join('')}
      </div>
      <button class="carousel__arrow carousel__arrow--prev" aria-label="前へ">&#9664;</button>
      <button class="carousel__arrow carousel__arrow--next" aria-label="次へ">&#9654;</button>
    `;

    this.stage = this.el.querySelector('.carousel__stage');
    this.items = [...this.el.querySelectorAll<HTMLElement>('.carousel__item')];
    this.setupInteraction();
    this.updateRadius();
    window.addEventListener('resize', this.updateRadius);
    this.startLoop();
  }

  override unmount(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.updateRadius);
    super.unmount();
  }

  private readonly updateRadius = (): void => {
    const width = this.el.clientWidth || window.innerWidth;
    this.radiusX = Math.max(140, Math.min(350, width / 2 - 90));
    this.radiusZ = this.radiusX * 0.5;
  };

  private step(): number {
    return 360 / Math.max(1, this.entries.length);
  }

  private setupInteraction(): void {
    const stage = this.stage!;

    stage.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.moved = false;
      this.lastX = e.clientX;
      this.targetRotation = null;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      if (Math.abs(dx) > 4) this.moved = true;
      this.rotation += dx * 0.35;
      this.lastX = e.clientX;
    });
    const end = (): void => {
      if (!this.dragging) return;
      this.dragging = false;
      this.resumeAt = performance.now() + GameCarousel.RESUME_DELAY_MS;
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);

    this.items.forEach((item) => {
      item.addEventListener('click', () => {
        if (this.moved) return; // ドラッグ操作はクリック扱いにしない
        const entry = this.entries[Number(item.dataset['index'])];
        if (entry) this.onSelect(entry.entryNo);
      });
    });

    this.el.querySelector('.carousel__arrow--prev')?.addEventListener('click', () => this.rotateBy(this.step()));
    this.el.querySelector('.carousel__arrow--next')?.addEventListener('click', () => this.rotateBy(-this.step()));
  }

  private rotateBy(delta: number): void {
    this.targetRotation = (this.targetRotation ?? this.rotation) + delta;
    this.resumeAt = performance.now() + GameCarousel.RESUME_DELAY_MS;
  }

  private startLoop(): void {
    this.lastTime = performance.now();
    const tick = (now: number): void => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      if (this.targetRotation !== null) {
        const diff = this.targetRotation - this.rotation;
        if (Math.abs(diff) < 0.1) {
          this.rotation = this.targetRotation;
          this.targetRotation = null;
        } else {
          this.rotation += diff * Math.min(1, dt * 7);
        }
      } else if (!this.dragging && now >= this.resumeAt) {
        this.rotation += GameCarousel.AUTO_SPEED * dt;
      }

      this.layout();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  /** 各アイコンを楕円軌道上に配置(角度 0 が正面) */
  private layout(): void {
    const step = this.step();
    this.items.forEach((item, i) => {
      const rad = ((this.rotation + step * i) * Math.PI) / 180;
      const x = Math.sin(rad) * this.radiusX;
      const z = Math.cos(rad) * this.radiusZ;
      const depth = z / this.radiusZ; // -1(奥)〜1(手前)
      const scale = 0.72 + 0.38 * ((depth + 1) / 2);
      item.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
      item.style.opacity = String(0.45 + 0.55 * ((depth + 1) / 2));
      item.style.zIndex = String(Math.round(depth * 100));
    });
  }
}
