import * as THREE from 'three';

const HOLD_MS = 4200;

type Draw = (ctx: CanvasRenderingContext2D) => void;

function sample(draw: Draw, n: number, width: number, W = 400, H = 400) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = ctx.strokeStyle = '#fff';
  ctx.lineCap = ctx.lineJoin = 'round';
  draw(ctx);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] > 128) pts.push(i % W, Math.floor(i / W));
  const out = new Float32Array(n * 3);
  const scale = width / W;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * (pts.length / 2)) * 2;
    out.set(
      [(pts[k] + Math.random() - W / 2) * scale, -(pts[k + 1] + Math.random() - H / 2) * scale, (Math.random() - 0.5) * 0.3],
      i * 3,
    );
  }
  return out;
}

const text =
  (label: string): Draw =>
  (ctx) => {
    const W = ctx.canvas.width;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let size = 260;
    ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
    size *= Math.min(1, (W * 0.9) / ctx.measureText(label).width);
    ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
    ctx.fillText(label, W / 2, ctx.canvas.height / 2 + size * 0.04);
  };

const line = (ctx: CanvasRenderingContext2D, width: number, ...pts: number[]) => {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
};

const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const swimmer: Draw = (ctx) => {
  dot(ctx, 118, 178, 24);
  line(ctx, 24, 150, 190, 290, 206);
  line(ctx, 20, 160, 190, 60, 200);
  line(ctx, 20, 196, 196, 222, 138, 262, 128);
  line(ctx, 20, 290, 206, 350, 192);
  line(ctx, 20, 290, 206, 350, 226);
  ctx.lineWidth = 12;
  for (const y of [262, 300]) {
    ctx.beginPath();
    for (let x = 30; x <= 370; x += 4) ctx.lineTo(x, y + Math.sin(x / 22) * 9);
    ctx.stroke();
  }
};

const cyclist: Draw = (ctx) => {
  ctx.lineWidth = 14;
  for (const x of [100, 300]) {
    ctx.beginPath();
    ctx.arc(x, 285, 64, 0, Math.PI * 2);
    ctx.stroke();
  }
  line(ctx, 12, 100, 285, 172, 205, 205, 285, 100, 285);
  line(ctx, 12, 172, 205, 268, 200, 300, 285);
  line(ctx, 12, 205, 285, 268, 200);
  line(ctx, 12, 262, 200, 272, 170, 292, 172);
  dot(ctx, 262, 108, 24);
  line(ctx, 22, 176, 188, 246, 134);
  line(ctx, 18, 240, 142, 280, 176);
  line(ctx, 20, 176, 190, 238, 222, 208, 282);
  line(ctx, 18, 176, 190, 212, 250, 184, 292);
};

const shoe: Draw = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(40, 300);
  ctx.lineTo(362, 300);
  ctx.quadraticCurveTo(392, 300, 382, 270);
  ctx.quadraticCurveTo(362, 236, 300, 226);
  ctx.lineTo(210, 198);
  ctx.quadraticCurveTo(182, 186, 166, 204);
  ctx.quadraticCurveTo(142, 222, 120, 196);
  ctx.lineTo(96, 166);
  ctx.quadraticCurveTo(58, 160, 54, 200);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  line(ctx, 7, 46, 280, 376, 280);
  for (const x of [220, 250, 280]) line(ctx, 7, x, 210 + (x - 220) * 0.28, x + 14, 234 + (x - 220) * 0.28);
  ctx.globalCompositeOperation = 'source-over';
};

const climber: Draw = (ctx) => {
  for (const [x, y] of [
    [140, 70],
    [268, 96],
    [110, 190],
    [300, 222],
    [158, 330],
    [258, 340],
  ])
    dot(ctx, x, y, 12);
  dot(ctx, 204, 124, 24);
  line(ctx, 24, 204, 152, 196, 240);
  line(ctx, 18, 202, 162, 160, 118, 144, 80);
  line(ctx, 18, 206, 162, 248, 136, 264, 104);
  line(ctx, 20, 196, 238, 156, 276, 162, 324);
  line(ctx, 20, 196, 238, 244, 282, 254, 334);
};

const ball: Draw = (ctx) => {
  dot(ctx, 200, 200, 150);
  ctx.globalCompositeOperation = 'destination-out';
  line(ctx, 10, 200, 50, 200, 350);
  line(ctx, 10, 50, 200, 350, 200);
  for (const x of [-45, 445]) {
    ctx.beginPath();
    ctx.arc(x, 200, 190, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

const cap: Draw = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(200, 88);
  ctx.lineTo(372, 158);
  ctx.lineTo(200, 228);
  ctx.lineTo(28, 158);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(108, 196);
  ctx.lineTo(108, 262);
  ctx.quadraticCurveTo(200, 312, 292, 262);
  ctx.lineTo(292, 196);
  ctx.lineTo(200, 234);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  line(ctx, 8, 108, 196, 200, 234, 292, 196);
  ctx.globalCompositeOperation = 'source-over';
  line(ctx, 8, 200, 158, 330, 176, 334, 262);
  ctx.fillRect(322, 256, 24, 40);
};

const SHAPES: [Draw, number, number?, number?][] = [
  [text('NDD'), 4.2, 640, 320],
  [swimmer, 3.8],
  [cyclist, 3.8],
  [shoe, 3.9],
  [climber, 3.6],
  [ball, 3.2],
  [cap, 3.8],
  [text('</>'), 3.9, 640, 320],
];

const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float seed;
  uniform float uT;
  uniform float uTime;
  uniform float uSize;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uForce;
  uniform vec2 uShock;
  uniform float uAlpha;
  uniform float uShockT;
  varying float vAlpha;

  void main() {
    float t = smoothstep(0.0, 1.0, clamp((uT - seed * 0.4) / 0.6, 0.0, 1.0));
    vec3 pos = mix(aFrom, aTo, t);

    float swirl = sin(t * 3.14159);
    pos += vec3(sin(seed * 41.0 + uTime), cos(seed * 23.0 + uTime * 1.3), sin(seed * 17.0 + uTime * 0.7)) * swirl * 0.6;
    pos += vec3(sin(uTime * 1.4 + seed * 30.0), cos(uTime * 1.1 + seed * 50.0), 0.0) * 0.02 * uMotion;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    world.xy += (d / max(dist, 0.001)) * uForce * exp(-dist * dist * 3.0) * (0.5 + seed * 0.6);

    vec2 sd = world.xy - uShock;
    float sr = length(sd);
    float front = uShockT * 5.0;
    float wave = exp(-pow((sr - front) * 2.2, 2.0)) * (1.0 - uShockT);
    world.xy += (sd / max(sr, 0.001)) * wave * (0.2 + seed * 0.3);
    world.z += wave * (seed - 0.5) * 0.7;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + seed) / -mv.z;

    vAlpha = (0.7 + 0.3 * seed) * smoothstep(-12.0, -4.0, mv.z) * uAlpha;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uEdge;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    vec3 color = gl_FragCoord.y < uEdge ? uPaper : uInk;
    gl_FragColor = vec4(color, smoothstep(0.5, 0.0, r) * vAlpha);
  }
`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => t * t * (3 - 2 * t);

export async function mountParticles(
  host: HTMLElement,
  hero: HTMLElement,
  panel: HTMLElement,
  onProgress: (p: number, panelTop: number) => void,
  onShape: (index: number, total: number) => void,
) {
  await document.fonts.load('800 100px "Barlow Condensed"').catch(() => {});
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  } catch {
    host.remove();
    return;
  }
  const mobile = matchMedia('(max-width: 900px)').matches;
  const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.z = 6;

  const n = mobile ? 14000 : 30000;
  const shapes = SHAPES.map(([draw, width, W, H]) => sample(draw, n, width, W, H));
  const geo = new THREE.BufferGeometry();
  const aFrom = new THREE.BufferAttribute(shapes[0].slice(), 3);
  const aTo = new THREE.BufferAttribute(shapes[0].slice(), 3);
  geo.setAttribute('position', aTo);
  geo.setAttribute('aFrom', aFrom);
  geo.setAttribute('aTo', aTo);
  geo.setAttribute('seed', new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uniforms = {
    uT: { value: 1 },
    uTime: { value: 0 },
    uSize: { value: 20 * dpr },
    uMotion: { value: reduced ? 0 : 1 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uForce: { value: 0 },
    uInk: { value: new THREE.Color() },
    uPaper: { value: new THREE.Color() },
    uEdge: { value: 0 },
    uShock: { value: new THREE.Vector2(99, 99) },
    uShockT: { value: 1 },
    uAlpha: { value: 1 },
  };
  let themeUntil = 0;
  const readTheme = () => {
    const css = getComputedStyle(document.documentElement);
    const fg = css.getPropertyValue('--fg').trim();
    const bg = css.getPropertyValue('--bg').trim();
    if (!fg || !bg) return false;
    uniforms.uInk.value.set(fg);
    uniforms.uPaper.value.set(bg);
    return true;
  };
  let themeReady = readTheme();
  const followTheme = () => (themeUntil = performance.now() + 1200);
  new MutationObserver(followTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', followTheme);

  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false }),
  );
  points.frustumCulled = false;
  scene.add(points);

  const view = { halfW: 1, halfH: 1, wide: true };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    view.halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    view.halfW = view.halfH * camera.aspect;
    view.wide = camera.aspect > 1.1;
  };
  new ResizeObserver(resize).observe(host);
  resize();

  let panelOffset = 0;
  const measure = () => (panelOffset = panel.getBoundingClientRect().top + scrollY);
  new ResizeObserver(measure).observe(document.body);
  measure();

  const pointer = new THREE.Vector2();
  let pointerIn = false;
  let pointerSpeed = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  addEventListener(
    'pointermove',
    (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -(e.clientY / host.clientHeight) * 2 + 1;
      pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(x - pointer.x, y - pointer.y) * 4);
      pointer.set(x, y);
      pointerIn = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => (pointerIn = false));

  let index = 0;
  let nextAt = performance.now() + HOLD_MS;
  const advance = () => {
    nextAt = performance.now() + HOLD_MS;
    if (uniforms.uT.value < 1) return;
    index = (index + 1) % shapes.length;
    (aFrom.array as Float32Array).set(aTo.array as Float32Array);
    (aTo.array as Float32Array).set(shapes[index]);
    aFrom.needsUpdate = aTo.needsUpdate = true;
    uniforms.uT.value = 0;
    onShape(index, shapes.length);
  };
  hero.addEventListener('click', advance);
  const shockPoint = new THREE.Vector3();
  addEventListener('pointerdown', (e) => {
    if (reduced) return;
    const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / host.clientHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, shockPoint)) {
      uniforms.uShock.value.set(shockPoint.x, shockPoint.y);
      uniforms.uShockT.value = 0;
    }
  });

  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  let spin = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1) || 1 / 60;
    last = now;

    if (!reduced && now > nextAt) advance();
    uniforms.uT.value = Math.min(1, uniforms.uT.value + dt / 1.4);
    uniforms.uShockT.value = Math.min(1, uniforms.uShockT.value + dt / 1.1);
    if (!reduced) {
      uniforms.uTime.value = now / 1000;
      spin += dt * 0.18;
    }

    const H = host.clientHeight;
    const panelTop = panelOffset - scrollY;
    const raw = clamp01(1 - panelTop / innerHeight);
    onProgress(raw, panelTop);
    if (!themeReady || now < themeUntil) themeReady = readTheme();
    uniforms.uEdge.value = Math.max(0, H - panelTop) * dpr;
    const p = ease(raw);
    const fit = Math.min(1, (view.halfW * 2 * 0.86) / 4.6);
    const anchorY = view.halfH - ((panelTop + innerHeight * (view.wide ? 0.42 : 0.19)) / H) * 2 * view.halfH;
    from.set(0, view.halfH * (view.wide ? 0.28 : 0.32), 0);
    to.set(view.wide ? view.halfW * 0.5 : 0, anchorY, 0);
    uniforms.uAlpha.value = view.wide ? 1 : clamp01(1 + panelTop / (innerHeight * 0.18));
    points.position.lerpVectors(from, to, p);
    points.scale.setScalar(fit * (1 - 0.35 * p));

    pointerSpeed *= 1 - Math.min(1, dt * 3);
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, uniforms.uMouse.value);
    const force = pointerIn && !reduced ? 0.35 + pointerSpeed * 0.9 : 0;
    uniforms.uForce.value += (force - uniforms.uForce.value) * Math.min(1, dt * 6);

    const sway = Math.sin(spin * 2) * 0.4;
    points.rotation.y += (sway + (pointerIn ? pointer.x * 0.3 : 0) - points.rotation.y) * Math.min(1, dt * 3);
    points.rotation.x += ((pointerIn ? -pointer.y * 0.2 : 0) - points.rotation.x) * Math.min(1, dt * 3);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
