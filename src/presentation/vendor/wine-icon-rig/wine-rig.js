// Live2D-style rig for the wine-5 profile icon: plain WebGL, no libraries.
// Parts are meshes whose vertices are moved every frame by Live2D-like parameters
// (head angle, eye open, eye ball, mouth, breath) plus a little spring physics for the hair.
// All coordinates are base-image pixels (1000 x 1000, y down).

const HEAD = { x: 450, y: 450, r: 330 };
const NECK = { x: 440, y: 770 };
const EYE = {
  L: { lashBase: 484, closed: 612, lashMid: 470 },
  R: { lashBase: 478, closed: 610, lashMid: 464 },
};
const MOUTH_TOP = 622;
const AHOGE_ROOT = { x: 400, y: 250 };
const DEPTH = { hair_back: -0.2, headphone: 0.35, face_skin: 0.5, bangs: 1.15, ahoge: 0.9 };
const CELL = 40; // mesh cell size in base pixels

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

function rot(x, y, cx, cy, deg) {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

class Spring {
  constructor(freq, damp, gain) {
    const w = 2 * Math.PI * freq;
    this.k = w * w; this.c = 2 * damp * w; this.g = gain; this.x = 0; this.v = 0;
  }
  step(drive, dt) {
    this.v += (-this.k * this.x - this.c * this.v - drive * this.g) * dt;
    this.x = clamp(this.x + this.v * dt, -40, 40);
  }
}

// ---------------------------------------------------------------- parameters & motion
function createAnimator() {
  const P = { angleX: 0, angleY: 0, angleZ: 0, eyeOpen: 1, eyeBallX: 0, eyeBallY: 0, mouth: 1, breath: 0 };
  let nextBlink = 1.2, talkUntil = -1, nextTalk = 4;
  const noise = (t, a, b) => Math.sin(t * a) * 0.6 + Math.sin(t * b + 1.3) * 0.4;

  function update(t, dt, look) {
    const dir = look ?? { x: noise(t, 0.37, 0.61) * 0.5, y: noise(t, 0.29, 0.47) * 0.35 };
    const target = {
      angleX: dir.x * 30, angleY: dir.y * 26, angleZ: -dir.x * 4 + noise(t, 0.21, 0.33) * 3,
      eyeBallX: clamp(dir.x * 1.2, -1, 1), eyeBallY: clamp(dir.y * 1.2, -1, 1),
      breath: 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 3.6), mouth: 1, eyeOpen: 1,
    };
    // blink (sometimes twice)
    const bt = t - nextBlink;
    if (bt > 0) {
      if (bt < 0.07) target.eyeOpen = 1 - bt / 0.07;
      else if (bt < 0.11) target.eyeOpen = 0;
      else if (bt < 0.26) target.eyeOpen = (bt - 0.11) / 0.15;
      else nextBlink = Math.random() < 0.2 ? t + 0.25 : t + 2 + Math.random() * 3.5;
    }
    // now and then a little chatter (the mouth is drawn open, so "talking" closes it a bit)
    if (t > nextTalk) { talkUntil = t + 1.6; nextTalk = t + 6 + Math.random() * 6; }
    if (t < talkUntil) target.mouth = 0.55 + 0.45 * Math.abs(Math.sin(t * 11));

    const fast = 1 - Math.exp(-dt * 40), slow = 1 - Math.exp(-dt * 6);
    for (const k of Object.keys(P)) P[k] = lerp(P[k], target[k], k === "eyeOpen" || k === "mouth" ? fast : slow);
    return P;
  }
  return { update };
}

// ---------------------------------------------------------------- deformation
function makeDeformer(phys) {
  function head(x, y, d, P) {
    const ax = P.angleX / 30, ay = P.angleY / 30;
    const nx = clamp((x - HEAD.x) / HEAD.r, -1.3, 1.3), ny = clamp((y - HEAD.y) / HEAD.r, -1.3, 1.3);
    x += ax * 16 * d * (1 - 0.5 * ny * ny);
    y -= ay * 11 * d * (1 - 0.5 * nx * nx);
    y -= P.breath * 3;
    return rot(x, y, NECK.x, NECK.y, P.angleZ * 0.6);
  }

  return function deform(name, x, y, P) {
    const side = name.endsWith("_L") ? "L" : name.endsWith("_R") ? "R" : "";
    if (side) {
      const e = EYE[side], o = clamp(P.eyeOpen, 0, 1);
      if (name.startsWith("lash")) {
        y = e.lashMid + (y - e.lashMid) * (0.6 + 0.4 * o) + (1 - o) * (e.closed - 6 - e.lashBase);
      } else {
        y = e.closed + (y - e.closed) * o;
        if (name.startsWith("iris")) { x += P.eyeBallX * 12; y -= P.eyeBallY * 8 * o; }
      }
    }
    if (name === "mouth") y = MOUTH_TOP + (y - MOUTH_TOP) * P.mouth;
    if (name === "bangs") { const t = clamp((y - 150) / 380, 0, 1.2); x += phys.bangs.x * t * t; }
    if (name === "hair_back") { const t = clamp((y - 250) / 500, 0, 1.2); x += phys.back.x * t * t; }
    if (name === "ahoge") [x, y] = rot(x, y, AHOGE_ROOT.x, AHOGE_ROOT.y, phys.ahoge.x * 0.8);
    return head(x, y, DEPTH[name] ?? 1, P);
  };
}

// ---------------------------------------------------------------- WebGL
const VS = `attribute vec2 aPos; attribute vec2 aUv; uniform vec2 uCanvas; varying vec2 vUv;
void main(){ vUv = aUv; vec2 p = aPos / uCanvas * 2.0 - 1.0; gl_Position = vec4(p.x, -p.y, 0.0, 1.0); }`;
const FS = `precision mediump float; varying vec2 vUv; uniform sampler2D uTex;
void main(){ gl_FragColor = texture2D(uTex, vUv); }`;

function compile(gl, vs, fs) {
  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  return prog;
}

function loadImage(url) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
}

function texture(gl, image) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/** A grid mesh over one part. Positions are rewritten every frame. */
function buildMesh(L, atlasSize) {
  const nx = clamp(Math.round(L.w / CELL), 2, 30), ny = clamp(Math.round(L.h / CELL), 2, 30);
  const rest = [], uv = [], idx = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const fx = i / nx, fy = j / ny;
    rest.push(L.x + fx * L.w, L.y + fy * L.h);
    uv.push((L.u + fx * L.uw) / atlasSize, (L.v + fy * L.vh) / atlasSize);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, b, d, a, d, c);
  }
  return { name: L.name, rest: new Float32Array(rest), pos: new Float32Array(rest.length), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
}

/** true when the rig can run: WebGL exists and the user has not asked for reduced motion */
export function canRunWineRig() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try { return !!document.createElement("canvas").getContext("webgl"); } catch { return false; }
}

/**
 * Start the rig on a canvas. Resolves once the images are loaded and the first frame is queued.
 * Returns { stop() }. Throws if WebGL is unavailable or the files cannot be loaded.
 * options: { modelUrl, pointerTarget (where to watch the mouse, default window), params (fixed parameter values, for testing) }
 */
export async function startWineRig(canvas, options) {
  const base = options.modelUrl.replace(/[^/]*$/, "");
  const model = await (await fetch(options.modelUrl)).json();
  const [CW, CH] = model.canvas;
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true, stencil: true });
  if (!gl) throw new Error("WebGL is not available");

  const program = (fs) => {
    const p = compile(gl, VS, fs);
    return { p, aPos: gl.getAttribLocation(p, "aPos"), aUv: gl.getAttribLocation(p, "aUv"), uCanvas: gl.getUniformLocation(p, "uCanvas") };
  };
  const main = program(FS);
  // stencil pass: discard transparent texels so only the eye white's real shape is written
  const mask = program(`precision mediump float; varying vec2 vUv; uniform sampler2D uTex;
    void main(){ if (texture2D(uTex, vUv).a < 0.5) discard; gl_FragColor = vec4(0.0); }`);
  let cur = main;
  const use = (pr) => {
    cur = pr; gl.useProgram(pr.p); gl.uniform2f(pr.uCanvas, CW, CH);
    gl.enableVertexAttribArray(pr.aPos); gl.enableVertexAttribArray(pr.aUv);
  };
  const [bgImg, atlasImg] = await Promise.all([loadImage(base + model.background), loadImage(base + model.atlas)]);
  const bgTex = texture(gl, bgImg), atlasTex = texture(gl, atlasImg);

  const meshes = model.layers.map((L) => {
    const m = buildMesh(L, model.atlasSize);
    m.posBuf = gl.createBuffer(); m.uvBuf = gl.createBuffer(); m.idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, m.uvBuf); gl.bufferData(gl.ARRAY_BUFFER, m.uv, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    return m;
  });
  const bgMesh = buildMesh({ name: "background", x: 0, y: 0, w: CW, h: CH, u: 0, v: 0, uw: 1, vh: 1 }, 1);
  bgMesh.pos.set(bgMesh.rest);
  for (const k of ["posBuf", "uvBuf", "idxBuf"]) bgMesh[k] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bgMesh.posBuf); gl.bufferData(gl.ARRAY_BUFFER, bgMesh.pos, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, bgMesh.uvBuf); gl.bufferData(gl.ARRAY_BUFFER, bgMesh.uv, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgMesh.idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bgMesh.idx, gl.STATIC_DRAW);

  // the iris is drawn only where its eye white is (stencil = Live2D clipping)
  const whiteOf = { iris_L: "eye_white_L", iris_R: "eye_white_R" };

  const phys = { bangs: new Spring(2.2, 0.16, 0.02), back: new Spring(1.6, 0.18, 0.012), ahoge: new Spring(2.8, 0.12, 0.06) };
  const deform = makeDeformer(phys);
  const animator = createAnimator();

  // pointer: direction from the icon's face, -1..1 (+y up); idle after 3s without movement
  let pointer = null, lastMove = -1e9, t = 0;
  const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; lastMove = t; };
  (options.pointerTarget ?? window).addEventListener("pointermove", onMove);

  let prevHead = null, prevVel = { x: 0, y: 0 }, acc = { x: 0, y: 0 };
  let raf = 0, last = performance.now(), running = true, visible = true;

  function draw(m, tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.posBuf); gl.vertexAttribPointer(cur.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.uvBuf); gl.vertexAttribPointer(cur.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.idxBuf);
    gl.drawElements(gl.TRIANGLES, m.idx.length, gl.UNSIGNED_SHORT, 0);
  }

  function frame(now) {
    if (!running || !visible) { raf = 0; return; }
    const dt = Math.min((now - last) / 1000, 1 / 20); last = now; t += dt;

    // canvas size follows its CSS size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

    let look = null;
    if (pointer && t - lastMove < 3) {
      const r = canvas.getBoundingClientRect();
      const fx = r.left + (HEAD.x / CW) * r.width, fy = r.top + (HEAD.y / CH) * r.height;
      look = { x: clamp((pointer.x - fx) / (window.innerWidth * 0.4), -1, 1), y: clamp(-(pointer.y - fy) / (window.innerHeight * 0.4), -1, 1) };
    }
    const P = options.params ? Object.assign(animator.update(t, dt, look), options.params) : animator.update(t, dt, look);

    // physics: the hair follows how fast the top of the head moves
    const hp = deform("ahoge", AHOGE_ROOT.x, AHOGE_ROOT.y, P);
    if (prevHead) {
      const vx = (hp[0] - prevHead[0]) / dt, vy = (hp[1] - prevHead[1]) / dt;
      acc = { x: lerp(acc.x, (vx - prevVel.x) / dt, 0.5), y: lerp(acc.y, (vy - prevVel.y) / dt, 0.5) };
      prevVel = { x: vx, y: vy };
    }
    prevHead = hp;
    phys.bangs.step(acc.x, dt); phys.back.step(acc.x, dt); phys.ahoge.step(acc.x + acc.y * 0.5, dt);

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clearStencil(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    use(main);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    draw(bgMesh, bgTex);

    const byName = {};
    for (const m of meshes) {
      for (let k = 0; k < m.rest.length; k += 2) {
        const [x, y] = deform(m.name, m.rest[k], m.rest[k + 1], P);
        m.pos[k] = x; m.pos[k + 1] = y;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, m.posBuf); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.DYNAMIC_DRAW);
      byName[m.name] = m;
    }
    for (const m of meshes) {
      const white = whiteOf[m.name];
      if (white) {
        // write the eye white's shape into the stencil, then draw the iris only inside it
        gl.enable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.ALWAYS, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        use(mask);
        draw(byName[white], atlasTex);
        use(main);
        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.EQUAL, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        draw(m, atlasTex);
        gl.disable(gl.STENCIL_TEST);
      } else {
        draw(m, atlasTex);
      }
    }
    raf = requestAnimationFrame(frame);
  }

  // sleep while the icon is scrolled out of view (saves battery on long pages)
  const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible && running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }) : null;
  io?.observe(canvas);

  raf = requestAnimationFrame(frame);
  return {
    stop() {
      running = false; cancelAnimationFrame(raf); raf = 0; io?.disconnect();
      (options.pointerTarget ?? window).removeEventListener("pointermove", onMove);
    },
  };
}
