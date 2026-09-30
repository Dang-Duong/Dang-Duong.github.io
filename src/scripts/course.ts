import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

type Segment = {
  name: string;
  dist: string;
  color: string;
  center: THREE.Vector3;
  rx: number;
  rz: number;
  phase: number;
  laps: number;
  samples: number;
  wobble: (t: number) => number;
  elevation: (t: number) => number;
};

const TRANSITION = new THREE.Vector3(0, 0, 2.2);

const SEGMENTS: Segment[] = [
  {
    name: 'Swim',
    dist: '3.8 km',
    color: '#3ad7ff',
    center: new THREE.Vector3(-1.3, 0, 2.2),
    rx: 1.3,
    rz: 0.6,
    phase: 0,
    laps: 1,
    samples: 60,
    wobble: () => 1,
    elevation: () => -0.02,
  },
  {
    name: 'Bike',
    dist: '180 km',
    color: '#d4ff3a',
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
    dist: '42.2 km',
    color: '#ff6a3d',
    center: new THREE.Vector3(1.8, 0, 2.2),
    rx: 1.8,
    rz: 0.9,
    phase: Math.PI,
    laps: 2,
    samples: 180,
    wobble: (t) => 1 + 0.06 * Math.sin(6 * t) * Math.sin(t / 2),
    elevation: (t) => 0.06 * (1 - Math.cos(4 * t)),
  },
];

function trace(s: Segment) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= s.samples; i++) {
    const t = (i / s.samples) * Math.PI * 2 * s.laps;
    const k = s.wobble(t);
    points.push(
      new THREE.Vector3(
        s.center.x + s.rx * k * Math.cos(t + s.phase),
        s.elevation(t),
        s.center.z + s.rz * k * Math.sin(t + s.phase),
      ),
    );
  }
  return points;
}

function glowTexture(color: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color);
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

function tag(html: string, color: string) {
  const el = document.createElement('div');
  el.className = 'course-tag';
  el.style.setProperty('--c', color);
  el.innerHTML = html;
  return new CSS2DObject(el);
}

export function mountCourse(host: HTMLElement) {
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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 6.5, 10.5);

  const grid = new THREE.GridHelper(18, 36, '#2a2d33', '#16181c');
  grid.position.y = -0.06;
  scene.add(grid);

  const path: THREE.Vector3[] = [];
  for (const s of SEGMENTS) {
    const points = trace(s);
    path.push(...points);
    const curve = new THREE.CatmullRomCurve3(points);
    const segs = points.length * 2;
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.035, 8), new THREE.MeshBasicMaterial({ color: s.color })));
    scene.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, segs, 0.13, 8),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
      ),
    );
    if (s.name === 'Bike') scene.add(curtain(points, s.color));
    const far = points[Math.floor(points.length / (2 * s.laps))];
    const label = tag(`<b>${s.name}</b> ${s.dist}`, s.color);
    label.position.copy(far).add(new THREE.Vector3(0, 0.45, 0));
    scene.add(label);
  }
  const finish = tag('<b>Finish</b> BSc 2026', '#f2f2ee');
  finish.position.copy(TRANSITION).add(new THREE.Vector3(0, 0.7, 0));
  scene.add(finish);

  const athlete = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture('rgba(212,255,58,0.9)'), blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  athlete.add(halo);
  scene.add(athlete);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.3, 0.4);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.35;
  controls.autoRotateSpeed = 0.7;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    const fit = Math.max(1, 1.35 / camera.aspect);
    camera.position.setLength(12.4 * fit);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotate = !reduced;
  const place = (u: number) => {
    const f = u * (path.length - 1);
    const i = Math.floor(f);
    athlete.position.lerpVectors(path[i], path[Math.min(i + 1, path.length - 1)], f - i);
    athlete.position.y += 0.05;
  };
  place(reduced ? 0.999 : 0);

  let visible = false;
  let running = false;
  const frame = (now: number) => {
    if (!visible) {
      running = false;
      return;
    }
    if (!reduced) {
      place((now / 22000) % 1);
      halo.scale.setScalar(0.7 + 0.15 * Math.sin(now / 180));
    }
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible || running) return;
    running = true;
    requestAnimationFrame(frame);
  }).observe(host);
}
