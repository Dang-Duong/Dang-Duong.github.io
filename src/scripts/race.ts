import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

type Leg = {
  name: string;
  km: number;
  speed: number;
  color: string;
  from: number;
  to: number;
  center: THREE.Vector3;
  rx: number;
  rz: number;
  phase: number;
  laps: number;
  samples: number;
  wobble: (t: number) => number;
  elevation: (t: number) => number;
};

export type RaceState = {
  p: number;
  leg: number;
  legFrac: number;
  km: number;
  speed: number;
  elevation: number;
  bpm: number;
};

export const TOTAL_KM = 226;
export const START = 0.12;
export const FINISH = 0.86;

const TRANSITION = new THREE.Vector3(0, 0, 2.2);

export const LEGS: Leg[] = [
  {
    name: 'Swim',
    km: 3.8,
    speed: 3.4,
    color: '#3ad7ff',
    from: START,
    to: 0.32,
    center: new THREE.Vector3(-1.3, 0, 2.2),
    rx: 1.3,
    rz: 0.6,
    phase: 0,
    laps: 1,
    samples: 80,
    wobble: () => 1,
    elevation: () => -0.02,
  },
  {
    name: 'Bike',
    km: 180,
    speed: 36,
    color: '#d4ff3a',
    from: 0.32,
    to: 0.6,
    center: new THREE.Vector3(0, 0, -1),
    rx: 4.5,
    rz: 3.2,
    phase: Math.PI / 2,
    laps: 1,
    samples: 260,
    wobble: (t) => 1 + 0.1 * Math.sin(3 * t) * Math.sin(t / 2),
    elevation: (t) => 0.55 * (1 - Math.cos(2 * t)) * (0.7 + 0.3 * Math.sin(5 * t)),
  },
  {
    name: 'Run',
    km: 42.2,
    speed: 12,
    color: '#ff6a3d',
    from: 0.6,
    to: FINISH - 0.02,
    center: new THREE.Vector3(1.8, 0, 2.2),
    rx: 1.8,
    rz: 0.9,
    phase: Math.PI,
    laps: 2,
    samples: 200,
    wobble: (t) => 1 + 0.06 * Math.sin(6 * t) * Math.sin(t / 2),
    elevation: (t) => 0.06 * (1 - Math.cos(4 * t)),
  },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function trace(leg: Leg) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= leg.samples; i++) {
    const t = (i / leg.samples) * Math.PI * 2 * leg.laps;
    const k = leg.wobble(t);
    points.push(
      new THREE.Vector3(
        leg.center.x + leg.rx * k * Math.cos(t + leg.phase),
        leg.elevation(t),
        leg.center.z + leg.rz * k * Math.sin(t + leg.phase),
      ),
    );
  }
  return points;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(212,255,58,0.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function curtain(points: THREE.Vector3[], color: string) {
  const pos: number[] = [];
  const index: number[] = [];
  points.forEach((p, i) => {
    pos.push(p.x, p.y, p.z, p.x, 0, p.z);
    if (i) index.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }),
  );
}

function tag(name: string, detail: string, color: string) {
  const el = document.createElement('div');
  el.className = 'course-tag';
  el.style.setProperty('--c', color);
  const b = document.createElement('b');
  b.textContent = name;
  el.append(b, ` ${detail}`);
  return new CSS2DObject(el);
}

export function mountRace(host: HTMLElement, track: HTMLElement, onUpdate: (s: RaceState) => void) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    host.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.prepend(renderer.domElement);
  const labels = new CSS2DRenderer();
  labels.domElement.className = 'course-labels';
  host.append(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

  const grid = new THREE.GridHelper(24, 48, '#2a2d33', '#16181c');
  grid.position.y = -0.06;
  scene.add(grid);

  const RADIAL = 8;
  const paths = LEGS.map((leg) => {
    const points = trace(leg);
    const curve = new THREE.CatmullRomCurve3(points);
    const segs = points.length * 2;
    scene.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, segs, 0.03, RADIAL),
        new THREE.MeshBasicMaterial({ color: leg.color, transparent: true, opacity: 0.22 }),
      ),
    );
    const lit = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.04, RADIAL), new THREE.MeshBasicMaterial({ color: leg.color }));
    const glow = new THREE.Mesh(
      new THREE.TubeGeometry(curve, segs, 0.14, RADIAL),
      new THREE.MeshBasicMaterial({ color: leg.color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    scene.add(lit, glow);
    if (leg.name === 'Bike') scene.add(curtain(points, leg.color));
    const far = points[Math.floor(points.length / (2 * leg.laps))];
    const label = tag(leg.name, `${leg.km} km`, leg.color);
    label.position.copy(far).add(new THREE.Vector3(0, 0.45, 0));
    scene.add(label);
    return { points, segs, lit: [lit, glow] };
  });

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.035, 8, 64, Math.PI),
    new THREE.MeshBasicMaterial({ color: '#f2f2ee' }),
  );
  arch.position.copy(TRANSITION);
  arch.rotation.y = Math.PI / 2;
  scene.add(arch);
  const finishTag = tag('Finish', 'BSc 2026', '#f2f2ee');
  finishTag.position.copy(TRANSITION).add(new THREE.Vector3(0, 1, 0));
  scene.add(finishTag);

  const athlete = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false }));
  athlete.add(halo);
  scene.add(athlete);

  let overviewRadius = 13;
  const view = { w: 1, h: 1 };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    view.w = w;
    view.h = h;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    overviewRadius = 13 * Math.max(1, 1.3 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dragYaw = 0;
  let dragging: number | null = null;
  host.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    dragging = e.clientX;
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove', (e) => {
    if (dragging === null) return;
    dragYaw += (e.clientX - dragging) * 0.006;
    dragging = e.clientX;
  });
  const release = () => (dragging = null);
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);

  const overviewTarget = new THREE.Vector3(0, 0.3, 0.4);
  const camPos = new THREE.Vector3();
  const look = overviewTarget.clone();
  const want = new THREE.Vector3();
  const wantLook = new THREE.Vector3();
  const chase = new THREE.Vector3();
  const chaseLook = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const heading = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  let p = 0;
  let lastP = 0;
  let pace = 0;
  let bpm = 72;
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
    p = reduced || first ? target : p + (target - p) * Math.min(1, dt * 7);
    pace += (Math.abs(p - lastP) / dt - pace) * Math.min(1, dt * 4);
    lastP = p;
    if (dragging === null) dragYaw *= 1 - Math.min(1, dt * 1.5);

    let legIndex = LEGS.findIndex((l) => p >= l.from && p < l.to);
    if (legIndex === -1) legIndex = p < START ? -1 : LEGS.length;
    const racing = legIndex >= 0 && legIndex < LEGS.length;
    const legFrac = racing ? (p - LEGS[legIndex].from) / (LEGS[legIndex].to - LEGS[legIndex].from) : legIndex < 0 ? 0 : 1;

    paths.forEach((path, j) => {
      const f = j < legIndex ? 1 : j === legIndex ? legFrac : 0;
      for (const m of path.lit) m.geometry.setDrawRange(0, Math.floor(f * path.segs) * RADIAL * 6);
    });

    let km = 0;
    const edge = (pts: THREE.Vector3[], i: number) =>
      tangent.subVectors(pts[Math.min(i + 6, pts.length - 1)], pts[Math.max(i - 6, 0)]).setY(0).normalize();
    if (legIndex < 0) {
      athlete.position.copy(TRANSITION);
      edge(paths[0].points, 0);
    } else if (!racing) {
      athlete.position.copy(TRANSITION);
      edge(paths[paths.length - 1].points, paths[paths.length - 1].points.length - 1);
      km = TOTAL_KM;
    } else {
      const pts = paths[legIndex].points;
      const f = legFrac * (pts.length - 1);
      const i = Math.floor(f);
      athlete.position.lerpVectors(pts[i], pts[Math.min(i + 1, pts.length - 1)], f - i);
      edge(pts, i);
      km = LEGS.slice(0, legIndex).reduce((s, l) => s + l.km, 0) + legFrac * LEGS[legIndex].km;
    }
    athlete.position.y += 0.06;
    if (!reduced) halo.scale.setScalar(0.38 + 0.06 * Math.sin(now / 160));

    const yaw = (reduced ? 0 : now / 20000) + dragYaw;
    want.set(Math.sin(yaw) * 0.72, 0.62, Math.cos(yaw) * 0.72).normalize().multiplyScalar(overviewRadius).add(overviewTarget);
    wantLook.copy(overviewTarget);
    const w = smooth(START - 0.04, START + 0.02, p) * (1 - smooth(FINISH - 0.04, FINISH + 0.02, p));
    heading.lerp(tangent, first || heading.lengthSq() === 0 ? 1 : Math.min(1, dt * 5)).normalize();
    if (w > 0) {
      chase.copy(athlete.position).addScaledVector(heading, -2.8).add(new THREE.Vector3(0, 1.3, 0));
      chase.sub(athlete.position).applyAxisAngle(up, dragYaw).add(athlete.position);
      chaseLook.copy(athlete.position).addScaledVector(heading, 1.6);
      want.lerp(chase, w);
      wantLook.lerp(chaseLook, w);
    }
    camPos.copy(want);
    look.copy(wantLook);
    first = false;
    camera.position.copy(camPos);
    camera.lookAt(look);
    const wide = camera.aspect > 1.1;
    const introW = 1 - smooth(START - 0.1, START - 0.02, p);
    const finishW = smooth(FINISH - 0.02, FINISH + 0.05, p);
    camera.setViewOffset(
      view.w,
      view.h,
      wide ? -0.2 * view.w * introW : 0,
      (wide ? 0 : 0.22 * view.h * introW + 0.18 * view.h * w) + 0.26 * view.h * finishW,
      view.w,
      view.h,
    );

    const effort = racing ? Math.min(1.3, pace / 0.05) : 0;
    bpm += (74 + (racing ? 40 : 0) + 55 * Math.min(effort, 1) - bpm) * Math.min(1, dt * 1.5);

    onUpdate({
      p,
      leg: legIndex,
      legFrac,
      km,
      speed: racing ? LEGS[legIndex].speed * effort : 0,
      elevation: Math.max(0, athlete.position.y - 0.06) * 140,
      bpm,
    });

    renderer.render(scene, camera);
    labels.render(scene, camera);
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
