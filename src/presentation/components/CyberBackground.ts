/**
 * 全セクションの背面で常時動き続けるサイバー背景。
 * 奥へスクロールする遠近グリッド床 + 漂う光の粒子 + 時々走る光の筋で
 * 「システムが稼働し続けている」ゲーム的な空気を作る。
 *
 * パフォーマンス配慮:
 * - タブ非表示中は requestAnimationFrame を止める
 * - prefers-reduced-motion 時は静止画を 1 枚描いて終了
 * - 粒子数は画面面積に応じて増減(スマホでは少なく)
 */

interface Particle {
  x: number;
  y: number;
  radius: number;
  /** 上昇速度(px/秒) */
  vy: number;
  /** 明滅の位相 */
  phase: number;
  /** マゼンタ系の粒子か(少数だけ混ぜる) */
  accent: boolean;
}

interface Streak {
  y: number;
  x: number;
  /** 進行速度(px/秒)。負なら右→左 */
  vx: number;
  length: number;
}

/** テーマごとの描画色(rgb 成分のみ持ち、alpha は描画時に付ける) */
const PALETTE = {
  dark: { cyan: '0, 229, 255', magenta: '255, 61, 129', gridAlpha: 0.14, dotAlpha: 0.6 },
  light: { cyan: '0, 122, 148', magenta: '216, 27, 96', gridAlpha: 0.1, dotAlpha: 0.45 },
} as const;

export class CyberBackground {
  private readonly canvas = document.createElement('canvas');
  private readonly ctx = this.canvas.getContext('2d')!;
  private particles: Particle[] = [];
  private streaks: Streak[] = [];
  private nextStreakAt = 0;
  private rafId = 0;
  private lastTime = 0;
  /** グリッドの奥行きスクロール位置(0〜1 でループ) */
  private scroll = 0;

  start(parent: HTMLElement): void {
    this.canvas.className = 'cyber-bg';
    this.canvas.setAttribute('aria-hidden', 'true');
    parent.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.draw(0);
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      } else if (this.rafId === 0) {
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
      }
    });

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.seedParticles();
  }

  private seedParticles(): void {
    const area = window.innerWidth * window.innerHeight;
    const count = Math.max(24, Math.min(80, Math.round(area / 26000)));
    this.particles = Array.from({ length: count }, () => this.newParticle(true));
  }

  private newParticle(anywhere: boolean): Particle {
    return {
      x: Math.random() * window.innerWidth,
      y: anywhere ? Math.random() * window.innerHeight : window.innerHeight + 4,
      radius: 0.6 + Math.random() * 1.4,
      vy: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      accent: Math.random() < 0.15,
    };
  }

  private readonly tick = (now: number): void => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.update(dt, now);
    this.draw(now);
    this.rafId = requestAnimationFrame(this.tick);
  };

  private update(dt: number, now: number): void {
    // グリッドは約 9 秒で 1 マスぶん奥から手前に流れる
    this.scroll = (this.scroll + dt / 9) % 1;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!;
      p.y -= p.vy * dt;
      if (p.y < -4) this.particles[i] = this.newParticle(false);
    }

    // 光の筋は 3〜8 秒間隔でランダムに発射
    if (now >= this.nextStreakAt) {
      const leftToRight = Math.random() < 0.5;
      const speed = 900 + Math.random() * 700;
      this.streaks.push({
        y: window.innerHeight * (0.08 + Math.random() * 0.5),
        x: leftToRight ? -260 : window.innerWidth + 260,
        vx: leftToRight ? speed : -speed,
        length: 160 + Math.random() * 180,
      });
      this.nextStreakAt = now + 3000 + Math.random() * 5000;
    }
    this.streaks.forEach((s) => (s.x += s.vx * dt));
    this.streaks = this.streaks.filter((s) => s.x > -600 && s.x < window.innerWidth + 600);
  }

  private draw(now: number): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const pal = PALETTE[theme];
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    this.drawGrid(ctx, w, h, pal);
    this.drawParticles(ctx, pal, now);
    this.drawStreaks(ctx, pal);
  }

  /** 画面下部 1/3 の遠近グリッド床。横線が奥から手前へ流れ続ける */
  private drawGrid(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    pal: (typeof PALETTE)[keyof typeof PALETTE],
  ): void {
    const horizon = h * 0.66;
    const vpX = w / 2;

    // 縦線: 消失点から放射状に
    const columns = 18;
    for (let i = 0; i <= columns; i++) {
      const xBottom = (i / columns) * w * 1.7 - w * 0.35;
      const alpha = pal.gridAlpha * (1 - Math.abs(i / columns - 0.5) * 0.9);
      ctx.strokeStyle = `rgba(${pal.cyan}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vpX, horizon);
      ctx.lineTo(xBottom, h);
      ctx.stroke();
    }

    // 横線: 奥(横線間隔が詰まる)から手前へ。scroll でオフセットしてループさせる
    const rows = 14;
    for (let i = 0; i < rows; i++) {
      const tt = (i + this.scroll) / rows;
      const y = horizon + (h - horizon) * tt * tt; // 二乗で手前ほど間隔が開く
      const alpha = pal.gridAlpha * tt * 1.6;
      ctx.strokeStyle = `rgba(${pal.cyan}, ${Math.min(alpha, pal.gridAlpha * 1.4)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 地平線をわずかに光らせる
    const glow = ctx.createLinearGradient(0, horizon - 24, 0, horizon + 10);
    glow.addColorStop(0, `rgba(${pal.cyan}, 0)`);
    glow.addColorStop(1, `rgba(${pal.cyan}, ${pal.gridAlpha * 0.8})`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, horizon - 24, w, 34);
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    pal: (typeof PALETTE)[keyof typeof PALETTE],
    now: number,
  ): void {
    for (const p of this.particles) {
      const twinkle = 0.55 + 0.45 * Math.sin(now / 900 + p.phase);
      const rgb = p.accent ? pal.magenta : pal.cyan;
      ctx.fillStyle = `rgba(${rgb}, ${(pal.dotAlpha * twinkle).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** データ転送のような水平の光の筋 */
  private drawStreaks(
    ctx: CanvasRenderingContext2D,
    pal: (typeof PALETTE)[keyof typeof PALETTE],
  ): void {
    for (const s of this.streaks) {
      const tail = s.vx > 0 ? s.x - s.length : s.x + s.length;
      const grad = ctx.createLinearGradient(tail, s.y, s.x, s.y);
      grad.addColorStop(0, `rgba(${pal.cyan}, 0)`);
      grad.addColorStop(1, `rgba(${pal.cyan}, 0.55)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tail, s.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  }
}
