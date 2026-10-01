import * as THREE from 'three';
import { asset } from '../util/html';

/**
 * 全セクションの背面に置く Three.js の奥行き背景「ホロ・アーカイブ回廊」。
 * 自分の作品のタイトル画面をホログラムのパネルにして回廊の左右に並べ、
 * スクロール量に応じてカメラが回廊の奥へ進む。背景を眺めるだけで作品紹介になるのが狙い。
 *
 * パフォーマンス配慮:
 * - パネル画像は images/depth/ の縮小版(幅 512px の webp)を使う
 * - タブ非表示中は requestAnimationFrame を止める
 * - prefers-reduced-motion 時はスクロールに追従させず、静止画を描くだけにする
 * - 縦長画面(スマホ)ではパネルと粒子を減らし、ピクセル比も抑える
 */

/**
 * パネルにする作品画像(images/depth/ 配下)。手前から順に並ぶので、見せたい作品を先頭に置く。
 * 作品を追加したら、タイトル画面を幅 512px の webp に縮小してここへ足す
 */
const PANEL_IMAGES = [
  'zirai-tyan',
  'chocho',
  'Tofu',
  'kodama',
  'mirror-luka',
  'win-vs-mac',
  'kiwa',
  'futago',
  'under-over',
  'v-battle',
  'teruteru',
  'the-mask-ball-seeker',
  'hanntenn-ansatu',
  'border',
  'MoreHit2',
  'takasi',
  'split',
] as const;

/** パネル同士の奥行き方向の間隔 */
const PANEL_SPACING = 3.4;
/** 最初のパネルの z 位置 */
const FIRST_PANEL_Z = -3;
/** スクロール 0 のときのカメラ z */
const CAMERA_START_Z = 5;
/** 床の高さ */
const FLOOR_Y = -2.2;

/** テーマごとの描画パラメータ */
const PALETTE = {
  dark: {
    cyan: new THREE.Color(0x00e5ff),
    magenta: new THREE.Color(0xff3d81),
    panelOpacity: 0.72,
    gridOpacity: 0.32,
    particleOpacity: 0.7,
    blending: THREE.AdditiveBlending,
  },
  light: {
    cyan: new THREE.Color(0x007a94),
    magenta: new THREE.Color(0xd81b60),
    panelOpacity: 0.55,
    gridOpacity: 0.22,
    particleOpacity: 0.45,
    blending: THREE.NormalBlending,
  },
} as const;

type Theme = keyof typeof PALETTE;

const PANEL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * 作品画像をホログラム風に見せる: シアン寄りの色味 + 走査線 + 時々走るグリッチ帯 + 枠線と四隅のブラケット
 */
const PANEL_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // 数秒に一度、細い帯だけ横にずれるグリッチ
    float t = floor(uTime * 6.0 + uSeed * 17.0);
    float band = step(0.965, hash(t)) * step(abs(uv.y - hash(t + 1.0)), 0.04);
    uv.x += band * (hash(t + 2.0) - 0.5) * 0.08;

    vec3 tex = texture2D(uMap, uv).rgb;
    // 元の絵柄を残しつつ、ホログラムらしくシアンへ寄せる
    vec3 col = mix(tex, tex * 0.55 + uColor * 0.45, 0.35);
    col += band * uAccent * 0.6;

    // 流れる走査線
    float scan = 0.88 + 0.12 * sin(uv.y * 420.0 - uTime * 6.0);
    col *= scan;

    // 枠線(縦横の太さが揃うようアスペクト比で補正)
    vec2 edge = min(vUv, 1.0 - vUv) * vec2(uAspect, 1.0);
    float d = min(edge.x, edge.y);
    float frame = smoothstep(0.018, 0.0, d);
    // 四隅のブラケットだけ太く光らせる
    vec2 corner = step(min(vUv, 1.0 - vUv) * vec2(uAspect, 1.0), vec2(0.16));
    float bracket = corner.x * corner.y * smoothstep(0.045, 0.02, d);
    col = mix(col, uColor * 1.4, max(frame, bracket));

    // 下に行くほど薄くして、床から投影されているような見え方に
    float fadeBottom = smoothstep(0.0, 0.25, vUv.y) * 0.6 + 0.4;
    gl_FragColor = vec4(col, uOpacity * fadeBottom * max(0.8, max(frame, bracket)));
  }
`;

/** 床のグリッド。カメラから遠いほど、また手前すぎるほど消える */
const GRID_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCameraZ;
  varying vec3 vWorld;

  void main() {
    vec2 coord = vWorld.xz / 1.2;
    vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float dist = abs(vWorld.z - uCameraZ);
    float fade = smoothstep(42.0, 6.0, dist) * smoothstep(0.0, 4.0, dist);
    // 回廊の中央を少し明るく
    float center = 1.0 - smoothstep(0.0, 9.0, abs(vWorld.x)) * 0.6;
    gl_FragColor = vec4(uColor, line * fade * center * uOpacity);
  }
`;

const GRID_VERTEX = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

interface Panel {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  /** 浮遊アニメーションの基準位置 */
  readonly baseY: number;
  readonly phase: number;
  /** テクスチャ読み込み後に 0→1 でフェードインさせる */
  loaded: number;
  ready: boolean;
}

export class DepthBackground {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
  private readonly panels: Panel[] = [];
  private readonly panelGroup = new THREE.Group();
  private readonly beams: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly grid: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private readonly horizon: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly timer = new THREE.Timer();
  private rafId = 0;
  /** stop() でまとめて外すためのリスナー登録用シグナル */
  private readonly listeners = new AbortController();
  private readonly themeObserver = new MutationObserver(() => {
    this.applyTheme();
    if (this.reducedMotion) this.render(0);
  });
  private stopped = false;
  private theme: Theme = 'dark';
  /** カメラ z の目標値(スクロールで決まる)と、ポインタによる視差の目標値 */
  private targetZ = CAMERA_START_Z;
  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private travel = 1;
  private narrow = false;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.narrow = window.innerWidth < window.innerHeight;
    const count = this.narrow ? 11 : PANEL_IMAGES.length;
    const images = PANEL_IMAGES.slice(0, count);
    this.travel = CAMERA_START_Z - (FIRST_PANEL_Z - (images.length - 1) * PANEL_SPACING) - 2;

    this.scene.add(this.panelGroup);
    images.forEach((name, i) => this.panels.push(this.createPanel(name, i)));
    this.beams = this.createBeams();
    this.grid = this.createGrid();
    this.particles = this.createParticles();
    this.horizon = this.createHorizon();
    this.scene.add(this.beams, this.grid, this.particles, this.horizon);
  }

  start(parent: HTMLElement): void {
    const canvas = this.renderer.domElement;
    canvas.className = 'cyber-bg depth-bg';
    canvas.setAttribute('aria-hidden', 'true');
    parent.appendChild(canvas);

    const { signal } = this.listeners;
    this.applyTheme();
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      if (this.reducedMotion) this.render(0);
    }, { signal });

    if (this.reducedMotion) {
      this.panels.forEach((p) => (p.loaded = 1));
      this.camera.position.set(0, 0.2, CAMERA_START_Z);
      this.render(0);
      return;
    }

    window.addEventListener('scroll', () => this.updateScrollTarget(), { passive: true, signal });
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        this.pointerTarget.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
      },
      { passive: true, signal },
    );
    this.updateScrollTarget();
    this.camera.position.z = this.targetZ;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      } else if (this.rafId === 0) {
        this.timer.reset();
        this.rafId = requestAnimationFrame(this.tick);
      }
    }, { signal });
    this.rafId = requestAnimationFrame(this.tick);
  }

  /** 描画を止め、GPU リソースとリスナーを解放して canvas を外す(設定で背景を切り替えたとき) */
  stop(): void {
    this.stopped = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.listeners.abort();
    this.themeObserver.disconnect();
    this.scene.traverse((obj) => {
      const { geometry, material } = obj as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
      geometry?.dispose();
      if (material instanceof THREE.ShaderMaterial) (material.uniforms['uMap']?.value as THREE.Texture | null)?.dispose();
      material?.dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  private createPanel(name: string, index: number): Panel {
    // 左右交互に並べ、少し内側(回廊の中央)へ向ける。中央はコンテンツのために空けておく
    const side = index % 2 === 0 ? -1 : 1;
    const jitter = seeded(index);
    const x = side * (this.narrow ? 1.5 + jitter * 0.5 : 3.0 + jitter * 1.6);
    const y = (this.narrow ? 0.4 : 0.1) + seeded(index + 40) * 1.4;
    const z = FIRST_PANEL_Z - index * PANEL_SPACING;
    const width = this.narrow ? 1.6 : 2.6;

    const material = new THREE.ShaderMaterial({
      vertexShader: PANEL_VERTEX,
      fragmentShader: PANEL_FRAGMENT,
      uniforms: {
        uMap: { value: null },
        uColor: { value: new THREE.Color() },
        uAccent: { value: new THREE.Color() },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uSeed: { value: index },
        uAspect: { value: 16 / 9 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = -side * 0.42;
    mesh.scale.set(width, width * (9 / 16), 1);
    this.panelGroup.add(mesh);

    const panel: Panel = { mesh, baseY: y, phase: jitter * Math.PI * 2, loaded: 0, ready: false };

    new THREE.TextureLoader().load(asset(`images/depth/${name}.webp`), (texture) => {
      if (this.stopped) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      const img = texture.image as { width: number; height: number };
      // 縦長の画像(アイコン等)は高さを抑えて横幅を詰める
      const aspect = img.width / img.height;
      const height = Math.min(width / aspect, width * 0.8);
      mesh.scale.set(height * aspect, height, 1);
      material.uniforms.uMap!.value = texture;
      material.uniforms.uAspect!.value = aspect;
      panel.ready = true;
      if (this.reducedMotion) {
        panel.loaded = 1;
        this.render(0);
      }
    });
    return panel;
  }

  /** 各パネルの下端から床へ伸びる投影光(1 本の LineSegments にまとめて描く) */
  private createBeams(): THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> {
    const points: number[] = [];
    for (const { mesh } of this.panels) {
      const { x, y, z } = mesh.position;
      points.push(x, y - 0.6, z, x, FLOOR_Y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35, depthWrite: false }),
    );
  }

  private createGrid(): THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
    const length = this.travel + 60;
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(60, length),
      new THREE.ShaderMaterial({
        vertexShader: GRID_VERTEX,
        fragmentShader: GRID_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 0 },
          uCameraZ: { value: CAMERA_START_Z },
        },
        transparent: true,
        depthWrite: false,
      }),
    );
    grid.rotation.x = -Math.PI / 2;
    grid.position.set(0, FLOOR_Y, CAMERA_START_Z - length / 2 + 10);
    return grid;
  }

  /** 回廊全体に漂う光の粒 */
  private createParticles(): THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> {
    const count = this.narrow ? 260 : 700;
    const positions = new Float32Array(count * 3);
    const zRange = this.travel + 30;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = FLOOR_Y + Math.random() * 8;
      positions[i * 3 + 2] = CAMERA_START_Z - Math.random() * zRange;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.045, transparent: true, depthWrite: false, sizeAttenuation: true }),
    );
  }

  /** 回廊の突き当たりで光る地平線。カメラと一緒に動き、常に一定の距離に見える */
  private createHorizon(): THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(90, 40),
      new THREE.ShaderMaterial({
        vertexShader: PANEL_VERTEX,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform vec3 uAccent;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - vec2(0.5, 0.42);
            float glow = exp(-dot(p * vec2(1.6, 6.0), p * vec2(1.6, 6.0)) * 18.0);
            vec3 col = mix(uAccent, uColor, smoothstep(-0.05, 0.08, p.y));
            gl_FragColor = vec4(col, glow * uOpacity);
          }
        `,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uAccent: { value: new THREE.Color() },
          uOpacity: { value: 0.35 },
        },
        transparent: true,
        depthWrite: false,
      }),
    );
  }

  private applyTheme(): void {
    this.theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const pal = PALETTE[this.theme];
    for (const { mesh } of this.panels) {
      mesh.material.uniforms.uColor!.value.copy(pal.cyan);
      mesh.material.uniforms.uAccent!.value.copy(pal.magenta);
      mesh.material.blending = pal.blending;
      mesh.material.needsUpdate = true;
    }
    this.beams.material.color.copy(pal.cyan);
    this.grid.material.uniforms.uColor!.value.copy(pal.cyan);
    this.grid.material.uniforms.uOpacity!.value = pal.gridOpacity;
    this.particles.material.color.copy(pal.cyan);
    this.particles.material.opacity = pal.particleOpacity;
    this.horizon.material.uniforms.uColor!.value.copy(pal.cyan);
    this.horizon.material.uniforms.uAccent!.value.copy(pal.magenta);
    this.horizon.material.uniforms.uOpacity!.value = this.theme === 'dark' ? 0.35 : 0.18;
  }

  private resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.narrow ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // 縦長画面では画角を広げて、左右のパネルが画面に収まるようにする
    this.camera.fov = w < h ? 70 : 55;
    this.camera.updateProjectionMatrix();
    this.updateScrollTarget();
  }

  /** ページ全体のスクロール率 0〜1 を回廊の進行度に対応させる */
  private updateScrollTarget(): void {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    this.targetZ = CAMERA_START_Z - progress * this.travel;
  }

  private readonly tick = (timestamp: number): void => {
    this.timer.update(timestamp);
    const dt = Math.min(this.timer.getDelta(), 0.1);
    const time = this.timer.getElapsed();

    // スクロールに少し遅れて追従させ、慣性のある「移動」感を出す
    const follow = 1 - Math.exp(-dt * 3.5);
    this.camera.position.z += (this.targetZ - this.camera.position.z) * follow;
    this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-dt * 2.5));

    this.render(time);
    this.rafId = requestAnimationFrame(this.tick);
  };

  private render(time: number): void {
    const cam = this.camera;
    const camZ = cam.position.z;
    cam.position.x = this.pointer.x * 0.9;
    cam.position.y = 0.2 - this.pointer.y * 0.4 + Math.sin(time * 0.5) * 0.05;
    cam.lookAt(this.pointer.x * 0.3, 0.3, camZ - 10);

    const pal = PALETTE[this.theme];
    for (const panel of this.panels) {
      const { mesh } = panel;
      if (panel.ready && panel.loaded < 1) panel.loaded = Math.min(1, panel.loaded + 0.02);
      mesh.position.y = panel.baseY + Math.sin(time * 0.6 + panel.phase) * 0.08;

      // カメラの横を通り過ぎる直前と、遠すぎる位置では消す(大きな画像が画面を覆わないように)
      const ahead = camZ - mesh.position.z;
      const near = smoothstep(1.2, 4.5, ahead);
      const far = 1 - smoothstep(22, 34, ahead);
      const uniforms = mesh.material.uniforms;
      uniforms.uOpacity!.value = pal.panelOpacity * near * far * panel.loaded;
      uniforms.uTime!.value = time;
      mesh.visible = uniforms.uOpacity!.value > 0.001;
    }

    this.grid.material.uniforms.uCameraZ!.value = camZ;
    this.horizon.position.set(cam.position.x * 0.5, 1.5, camZ - 60);
    this.renderer.render(this.scene, cam);
  }
}

/** インデックスから決まる 0〜1 の疑似乱数(リロードしても配置が変わらないように) */
function seeded(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
