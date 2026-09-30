import * as THREE from 'three';

export type RaceState = { p: number; leg: number; legFrac: number; km: number };

export const TOTAL_KM = 226;
export const START = 0.12;
export const FINISH = 0.86;

export const LEGS = [
  { name: 'Swim', km: 3.8, color: '#3ad7ff', glyph: '🏊', from: START, to: 0.34 },
  { name: 'Bike', km: 180, color: '#d4ff3a', glyph: '🚴', from: 0.34, to: 0.6 },
  { name: 'Run', km: 42.2, color: '#ff6a3d', glyph: '🏃', from: 0.6, to: FINISH },
];

const MORPH_KEYS: [number, number][] = [
  [START - 0.03, 0],
  [START + 0.03, 1],
  [0.32, 1],
  [0.37, 2],
  [0.58, 2],
  [0.63, 3],
  [FINISH - 0.02, 3],
  [FINISH + 0.04, 4],
];

const COLORS = ['#f2f2ee', '#3ad7ff', '#d4ff3a', '#ff6a3d', '#ffc83a'];
const SIZE = 3.4;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function morphAt(p: number) {
  if (p <= MORPH_KEYS[0][0]) return MORPH_KEYS[0][1];
  for (let i = 1; i < MORPH_KEYS.length; i++) {
    const [p1, m1] = MORPH_KEYS[i];
    const [p0, m0] = MORPH_KEYS[i - 1];
    if (p <= p1) return m0 + (m1 - m0) * smooth(p0, p1, p);
  }
  return MORPH_KEYS[MORPH_KEYS.length - 1][1];
}

function sphere(n: number) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = 1.25 + (Math.random() - 0.5) * 0.12;
    out.set([Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k], i * 3);
  }
  return out;
}

function sampleGlyph(glyph: string, fallback: string, n: number) {
  const S = 220;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const collect = () => {
    const data = ctx.getImageData(0, 0, S, S).data;
    const pts: number[] = [];
    for (let i = 0; i < S * S; i++) {
      if (data[i * 4 + 3] > 120) {
        const lum = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 765;
        pts.push(i % S, Math.floor(i / S), lum);
      }
    }
    return pts;
  };
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '170px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(glyph, S / 2, S / 2 + 8);
  let pts = collect();
  let mirror = -1;
  if (pts.length < 1500) {
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = '#fff';
    ctx.font = '800 96px "Barlow Condensed", sans-serif';
    ctx.fillText(fallback, S / 2, S / 2);
    pts = collect();
    mirror = 1;
  }
  const count = pts.length / 3;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * count) * 3;
    const x = (pts[k] + Math.random() - S / 2) / S;
    const y = (pts[k + 1] + Math.random() - S / 2) / S;
    out.set([mirror * x * SIZE, -y * SIZE, (pts[k + 2] - 0.5) * 0.7 + (Math.random() - 0.5) * 0.12], i * 3);
  }
  return out;
}

const vertexShader = /* glsl */ `
  attribute vec3 s0;
  attribute vec3 s1;
  attribute vec3 s2;
  attribute vec3 s3;
  attribute vec3 s4;
  attribute float seed;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uForce;
  uniform vec3 uColors[5];
  varying vec3 vColor;
  varying float vAlpha;

  vec3 shape(float i) {
    if (i < 0.5) return s0;
    if (i < 1.5) return s1;
    if (i < 2.5) return s2;
    if (i < 3.5) return s3;
    return s4;
  }

  void main() {
    float m = clamp(uMorph, 0.0, 4.0);
    float i = min(floor(m), 3.0);
    float f = m - i;
    float t = smoothstep(0.0, 1.0, clamp((f - seed * 0.4) / 0.6, 0.0, 1.0));
    vec3 pos = mix(shape(i), shape(i + 1.0), t);

    float swirl = sin(t * 3.14159);
    pos += vec3(sin(seed * 41.0 + uTime), cos(seed * 23.0 + uTime * 1.3), sin(seed * 17.0 + uTime * 0.7)) * swirl * 0.9;
    pos += vec3(sin(uTime * 1.4 + seed * 30.0), cos(uTime * 1.1 + seed * 50.0), 0.0) * 0.025 * uMotion;
    pos.x -= uSpeed * (0.3 + seed * 1.4);
    pos.y += uSpeed * (seed - 0.5) * 0.25;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    world.xy += (d / max(dist, 0.001)) * uForce * exp(-dist * dist * 3.0) * (0.5 + seed * 0.6);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + seed) / -mv.z;

    int a = int(i);
    int b = int(min(i + 1.0, 4.0));
    vColor = mix(uColors[a], uColors[b], t);
    vAlpha = 0.45 + 0.55 * seed;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, r) * vAlpha);
  }
`;

export function mountRace(host: HTMLElement, track: HTMLElement, onUpdate: (s: RaceState) => void) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  } catch {
    host.remove();
    return;
  }
  const dpr = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 6.5);

  const n = matchMedia('(max-width: 900px)').matches ? 14000 : 32000;
  const geo = new THREE.BufferGeometry();
  const shapes = [
    sphere(n),
    ...LEGS.map((l) => sampleGlyph(l.glyph, l.name.toUpperCase(), n)),
    sampleGlyph('🏅', '2026', n),
  ];
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3));
  shapes.forEach((s, i) => geo.setAttribute(`s${i}`, new THREE.BufferAttribute(s, 3)));
  geo.setAttribute('seed', new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uniforms = {
    uMorph: { value: 0 },
    uTime: { value: 0 },
    uSpeed: { value: 0 },
    uSize: { value: 26 * dpr },
    uMotion: { value: reduced ? 0 : 1 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uForce: { value: 0 },
    uColors: { value: COLORS.map((c) => new THREE.Color(c)) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  points.frustumCulled = false;
  scene.add(points);

  const view = { w: 1, h: 1, z: 6.5 };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    view.w = w;
    view.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    view.z = 6.5 * Math.max(1, 0.9 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const pointer = new THREE.Vector2();
  let pointerIn = false;
  let pointerSpeed = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  addEventListener(
    'pointermove',
    (e) => {
      const rect = host.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(x - pointer.x, y - pointer.y) * 4);
      pointer.set(x, y);
      pointerIn = true;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => (pointerIn = false));

  let p = 0;
  let lastP = 0;
  let pace = 0;
  let last = performance.now();
  let first = true;

  const frame = (now: number) => {
    if (!visible) {
      running = false;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1) || 1 / 60;
    last = now;

    const rect = track.getBoundingClientRect();
    const target = clamp01(-rect.top / Math.max(1, rect.height - innerHeight));
    p = reduced || first ? target : p + (target - p) * Math.min(1, dt * 6);
    pace += (Math.abs(p - lastP) / dt - pace) * Math.min(1, dt * 4);
    lastP = p;
    first = false;

    let leg = LEGS.findIndex((l) => p >= l.from && p < l.to);
    if (leg === -1) leg = p < START ? -1 : LEGS.length;
    const racing = leg >= 0 && leg < LEGS.length;
    const legFrac = racing ? (p - LEGS[leg].from) / (LEGS[leg].to - LEGS[leg].from) : leg < 0 ? 0 : 1;
    const km = leg < 0 ? 0 : !racing ? TOTAL_KM : LEGS.slice(0, leg).reduce((s, l) => s + l.km, 0) + legFrac * LEGS[leg].km;

    uniforms.uMorph.value = morphAt(p);
    if (!reduced) uniforms.uTime.value = now / 1000;
    uniforms.uSpeed.value += ((reduced ? 0 : Math.min(1.4, pace * 12)) - uniforms.uSpeed.value) * Math.min(1, dt * 5);

    pointerSpeed *= 1 - Math.min(1, dt * 3);
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, uniforms.uMouse.value);
    const force = pointerIn && !reduced ? 0.35 + pointerSpeed * 0.9 : 0;
    uniforms.uForce.value += (force - uniforms.uForce.value) * Math.min(1, dt * 6);

    const sway = reduced ? 0 : Math.sin(now / 3200) * 0.35;
    points.rotation.y += (sway + pointer.x * 0.25 - points.rotation.y) * Math.min(1, dt * 3);
    points.rotation.x += (-pointer.y * 0.12 - points.rotation.x) * Math.min(1, dt * 3);

    const wide = camera.aspect > 1.1;
    const introW = 1 - smooth(START - 0.1, START - 0.02, p);
    const finishW = smooth(FINISH - 0.02, FINISH + 0.05, p);
    const raceW = 1 - introW - finishW;
    camera.position.z = view.z * (1 + 0.45 * finishW);
    camera.setViewOffset(
      view.w,
      view.h,
      wide ? -0.2 * view.w * introW - 0.12 * view.w * raceW : 0,
      (wide ? 0 : 0.2 * view.h * introW + 0.12 * view.h * raceW) + 0.13 * view.h * finishW,
      view.w,
      view.h,
    );

    onUpdate({ p, leg, legFrac, km });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };

  let visible = false;
  let running = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible || running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }).observe(track);
}
