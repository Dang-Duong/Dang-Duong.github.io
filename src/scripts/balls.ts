import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Kind = 'football' | 'basketball' | 'volt';
type Ball = {
  mesh: THREE.Mesh;
  shadow: THREE.Mesh;
  r: number;
  p: THREE.Vector2;
  v: THREE.Vector2;
  w: THREE.Vector3;
};

const GRAVITY = -30;
const BOUNCE_FLOOR = 0.7;
const BOUNCE_WALL = 0.75;
const BOUNCE_BALL = 0.85;
const MAX_BALLS = 12;
const RADIUS: Record<Kind, number> = { football: 1.1, basketball: 1.25, volt: 0.8 };
const START: Kind[] = ['football', 'basketball', 'volt', 'football', 'basketball'];

function paintSphere(pixel: (d: THREE.Vector3) => [number, number, number]) {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = new THREE.Vector3();
  for (let y = 0; y < h; y++) {
    const theta = (y / h) * Math.PI;
    for (let x = 0; x < w; x++) {
      const phi = (x / w) * Math.PI * 2;
      d.set(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
      const [r, g, b] = pixel(d);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function footballTexture() {
  const ico = new THREE.IcosahedronGeometry(1, 0).getAttribute('position');
  const verts: THREE.Vector3[] = [];
  const faces: THREE.Vector3[] = [];
  for (let i = 0; i < ico.count; i += 3) {
    const tri = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(ico, i + k).normalize());
    faces.push(tri[0].clone().add(tri[1]).add(tri[2]).normalize());
    for (const v of tri) if (!verts.some((u) => u.distanceTo(v) < 1e-3)) verts.push(v);
  }
  return paintSphere((d) => {
    let best = -2;
    let second = -2;
    let pentagon = false;
    const test = (c: THREE.Vector3, isPent: boolean) => {
      const s = d.dot(c) - (isPent ? 0.035 : 0);
      if (s > best) {
        second = best;
        best = s;
        pentagon = isPent;
      } else if (s > second) second = s;
    };
    verts.forEach((c) => test(c, true));
    faces.forEach((c) => test(c, false));
    if (best - second < 0.012) return [60, 60, 64];
    return pentagon ? [18, 18, 20] : [240, 240, 234];
  });
}

function basketballTexture() {
  return paintSphere((d) => {
    const t = 0.02;
    const curve = Math.abs(Math.abs(d.x) - (0.62 + 0.3 * d.z * d.z));
    const seam = Math.abs(d.z) < t || Math.abs(d.y) < t || curve < t;
    if (seam) return [22, 16, 12];
    const n = (Math.random() - 0.5) * 18;
    return [196 + n, 78 + n * 0.6, 24 + n * 0.3];
  });
}

function voltTexture() {
  const canvas = paintSphere(() => {
    const n = (Math.random() - 0.5) * 16;
    return [212 + n, 255, 58 + n];
  });
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0b0c0e';
  ctx.fillRect(0, 196, 1024, 6);
  ctx.fillRect(0, 310, 1024, 6);
  ctx.font = '800 110px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const x of [256, 768]) ctx.fillText('140.6', x, 260);
  return canvas;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export async function mountBalls(host: HTMLElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    host.remove();
    return;
  }
  await document.fonts.load('800 110px "Barlow Condensed"').catch(() => {});

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight('#ffffff', 1.4);
  key.position.set(-4, 8, 10);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 20);

  const toTexture = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const materials: Record<Kind, THREE.Material> = {
    football: new THREE.MeshPhysicalMaterial({ map: toTexture(footballTexture()), roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    basketball: new THREE.MeshPhysicalMaterial({ map: toTexture(basketballTexture()), roughness: 0.75 }),
    volt: new THREE.MeshPhysicalMaterial({ map: toTexture(voltTexture()), roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color('#d4ff3a') }),
  };
  const sphere = new THREE.SphereGeometry(1, 64, 48);
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false });

  const bounds = { halfW: 10, halfH: 6, floor: -6, scale: 1 };
  const balls: Ball[] = [];

  const spawn = (kind: Kind, x: number, y: number, vx = 0, vy = 0) => {
    if (balls.length >= MAX_BALLS) return;
    const r = RADIUS[kind] * bounds.scale;
    const mesh = new THREE.Mesh(sphere, materials[kind]);
    mesh.scale.setScalar(r);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone());
    shadow.renderOrder = -1;
    scene.add(shadow, mesh);
    balls.push({ mesh, shadow, r, p: new THREE.Vector2(x, y), v: new THREE.Vector2(vx, vy), w: new THREE.Vector3(0, 0, -vx / r) });
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bounds.halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    bounds.halfW = bounds.halfH * camera.aspect;
    bounds.floor = -bounds.halfH + 0.4;
    bounds.scale = THREE.MathUtils.clamp(bounds.halfW / 9, 0.5, 1);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const startCount = bounds.halfW < 5 ? 3 : START.length;
  START.slice(0, startCount).forEach((kind, i) => {
    const x = THREE.MathUtils.lerp(-bounds.halfW * 0.2, bounds.halfW * 0.8, startCount > 1 ? i / (startCount - 1) : 0.5);
    spawn(kind, x, bounds.halfH + 2 + i * 2.5, (Math.random() - 0.5) * 4);
  });

  const sync = () => {
    for (const b of balls) {
      b.mesh.position.set(b.p.x, b.p.y, 0);
      const height = Math.max(0, b.p.y - b.r - bounds.floor);
      const s = b.r * 2.2 * (1 + height * 0.04);
      b.shadow.position.set(b.p.x, bounds.floor, -b.r);
      b.shadow.scale.set(s, s * 0.22, 1);
      (b.shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 / (1 + height * 0.35);
    }
    renderer.render(scene, camera);
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    balls.forEach((b) => b.p.set(b.p.x, bounds.floor + b.r));
    sync();
    new ResizeObserver(sync).observe(host);
    return;
  }

  let held: { ball: Ball; offset: THREE.Vector2; trail: { x: number; y: number; t: number }[] } | null = null;
  const toWorld = (e: { clientX: number; clientY: number }) => {
    const rect = host.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width - 0.5) * 2 * bounds.halfW,
      -((e.clientY - rect.top) / rect.height - 0.5) * 2 * bounds.halfH,
    );
  };
  const hit = (pt: THREE.Vector2) => balls.find((b) => b.p.distanceTo(pt) < b.r * 1.15);

  const grab = (e: { clientX: number; clientY: number }) => {
    const pt = toWorld(e);
    const ball = hit(pt);
    if (!ball) return false;
    held = { ball, offset: ball.p.clone().sub(pt), trail: [{ x: pt.x, y: pt.y, t: performance.now() }] };
    host.classList.add('grabbing');
    return true;
  };
  const move = (e: { clientX: number; clientY: number }) => {
    const pt = toWorld(e);
    host.classList.toggle('over-ball', !!hit(pt));
    if (!held) return;
    const now = performance.now();
    held.trail.push({ x: pt.x, y: pt.y, t: now });
    while (held.trail.length > 2 && now - held.trail[0].t > 90) held.trail.shift();
    held.ball.p.copy(pt.add(held.offset));
  };
  const release = () => {
    if (!held) return;
    const { ball, trail } = held;
    const a = trail[0];
    const b = trail[trail.length - 1];
    const dt = Math.max((b.t - a.t) / 1000, 1 / 120);
    ball.v.set((b.x - a.x) / dt, (b.y - a.y) / dt).clampLength(0, 45);
    ball.w.set(ball.v.y / ball.r * 0.3, 0, -ball.v.x / ball.r);
    held = null;
    host.classList.remove('grabbing');
  };

  host.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && grab(e)) host.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove', (e) => e.pointerType === 'mouse' && move(e));
  host.addEventListener('pointerup', release);
  host.addEventListener(
    'touchstart',
    (e) => {
      if (grab(e.touches[0])) e.preventDefault();
    },
    { passive: false },
  );
  host.addEventListener(
    'touchmove',
    (e) => {
      if (!held) return;
      e.preventDefault();
      move(e.touches[0]);
    },
    { passive: false },
  );
  host.addEventListener('touchend', release);
  host.addEventListener('touchcancel', release);
  host.addEventListener('dblclick', (e) => {
    const pt = toWorld(e);
    if (hit(pt)) return;
    spawn(START[balls.length % START.length], pt.x, pt.y, (Math.random() - 0.5) * 6, 4);
  });

  const collide = (a: Ball, b: Ball) => {
    const d = b.p.clone().sub(a.p);
    const dist = d.length();
    const min = a.r + b.r;
    if (dist >= min || dist === 0) return;
    const n = d.divideScalar(dist);
    const ia = held?.ball === a ? 0 : 1 / (a.r * a.r);
    const ib = held?.ball === b ? 0 : 1 / (b.r * b.r);
    if (ia + ib === 0) return;
    const overlap = min - dist;
    a.p.addScaledVector(n, (-overlap * ia) / (ia + ib));
    b.p.addScaledVector(n, (overlap * ib) / (ia + ib));
    const vn = b.v.clone().sub(a.v).dot(n);
    if (vn >= 0) return;
    const j = (-(1 + BOUNCE_BALL) * vn) / (ia + ib);
    a.v.addScaledVector(n, -j * ia);
    b.v.addScaledVector(n, j * ib);
  };

  const step = (dt: number) => {
    for (const b of balls) {
      if (held?.ball === b) {
        b.v.set(0, 0);
        continue;
      }
      b.v.y += GRAVITY * dt;
      b.v.multiplyScalar(0.999);
      b.p.addScaledVector(b.v, dt);
      if (b.p.y - b.r < bounds.floor) {
        b.p.y = bounds.floor + b.r;
        b.v.y = Math.abs(b.v.y) < 1.5 ? 0 : -b.v.y * BOUNCE_FLOOR;
        b.v.x *= 0.985;
        b.w.set(0, 0, -b.v.x / b.r);
      }
      if (Math.abs(b.p.x) + b.r > bounds.halfW) {
        b.p.x = Math.sign(b.p.x) * (bounds.halfW - b.r);
        b.v.x = -b.v.x * BOUNCE_WALL;
      }
      if (b.p.y - b.r > bounds.halfH * 3) b.v.y = -Math.abs(b.v.y);
    }
    for (let i = 0; i < balls.length; i++) for (let k = i + 1; k < balls.length; k++) collide(balls[i], balls[k]);
    for (const b of balls) {
      const angle = b.w.length() * dt;
      if (angle) b.mesh.rotateOnWorldAxis(b.w.clone().normalize(), angle);
    }
  };

  let visible = false;
  let running = false;
  let last = 0;
  const frame = (now: number) => {
    if (!visible) {
      running = false;
      return;
    }
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    const steps = Math.ceil(dt / (1 / 240));
    for (let i = 0; i < steps; i++) step(dt / steps);
    sync();
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible || running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }).observe(host);
}
