import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const HOLD_MS = 4200;

function sphere(n: number) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = 1.45 + (Math.random() - 0.5) * 0.06;
    out.set([Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k], i * 3);
  }
  return out;
}

function wave(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 4;
    const z = (Math.random() - 0.5) * 2.6;
    const y = 0.35 * Math.sin(x * 1.8 + z * 1.2) + 0.2 * Math.cos(z * 2.4);
    out.set([x, y, z], i * 3);
  }
  return out;
}

function surface(geometry: THREE.BufferGeometry, n: number) {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
  const out = new Float32Array(n * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    sampler.sample(p);
    out.set([p.x, p.y, p.z], i * 3);
  }
  geometry.dispose();
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
  uniform float uSize;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uForce;
  uniform vec3 uInk;
  uniform vec3 uAccent;
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
    pos += vec3(sin(seed * 41.0 + uTime), cos(seed * 23.0 + uTime * 1.3), sin(seed * 17.0 + uTime * 0.7)) * swirl * 0.6;
    pos += vec3(sin(uTime * 1.4 + seed * 30.0), cos(uTime * 1.1 + seed * 50.0), 0.0) * 0.02 * uMotion;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    world.xy += (d / max(dist, 0.001)) * uForce * exp(-dist * dist * 3.0) * (0.5 + seed * 0.6);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + seed) / -mv.z;

    vColor = abs(seed - 0.5) < 0.04 ? uAccent : uInk;
    vAlpha = (0.45 + 0.45 * seed) * smoothstep(-9.0, -4.0, mv.z);
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

export function mountParticles(host: HTMLElement) {
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

  const n = matchMedia('(max-width: 900px)').matches ? 14000 : 30000;
  const shapes = [
    sphere(n),
    surface(new THREE.TorusKnotGeometry(0.95, 0.3, 220, 32), n),
    wave(n),
    surface(new THREE.TorusGeometry(1.3, 0.12, 24, 160), n),
  ];
  const count = shapes.length;
  shapes.push(shapes[0]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3));
  shapes.forEach((s, i) => geo.setAttribute(`s${i}`, new THREE.BufferAttribute(s, 3)));
  geo.setAttribute('seed', new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uniforms = {
    uMorph: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: 20 * dpr },
    uMotion: { value: reduced ? 0 : 1 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uForce: { value: 0 },
    uInk: { value: new THREE.Color() },
    uAccent: { value: new THREE.Color() },
  };
  const readTheme = () => {
    const css = getComputedStyle(document.documentElement);
    uniforms.uInk.value.set(css.getPropertyValue('--fg').trim());
    uniforms.uAccent.value.set(css.getPropertyValue('--accent').trim());
  };
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);

  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false }),
  );
  points.frustumCulled = false;
  points.rotation.x = 0.35;
  scene.add(points);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = 6 * Math.max(1, 0.9 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const pointer = new THREE.Vector2();
  let pointerIn = false;
  let pointerSpeed = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  host.addEventListener(
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
  host.addEventListener('pointerleave', () => (pointerIn = false));

  let target = 0;
  let nextAt = performance.now() + HOLD_MS;
  const advance = () => {
    target += 1;
    nextAt = performance.now() + HOLD_MS;
  };
  host.addEventListener('click', advance);

  let spin = 0;
  let last = performance.now();
  const frame = (now: number) => {
    if (!visible) {
      running = false;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1) || 1 / 60;
    last = now;

    if (!reduced && now > nextAt) advance();
    const m = uniforms.uMorph;
    m.value += (target - m.value) * Math.min(1, dt * 2.2);
    if (m.value > count - 0.001) {
      m.value -= count;
      target -= count;
    }
    if (!reduced) {
      uniforms.uTime.value = now / 1000;
      spin += dt * 0.18;
    }

    pointerSpeed *= 1 - Math.min(1, dt * 3);
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, uniforms.uMouse.value);
    const force = pointerIn && !reduced ? 0.35 + pointerSpeed * 0.9 : 0;
    uniforms.uForce.value += (force - uniforms.uForce.value) * Math.min(1, dt * 6);

    points.rotation.y = spin + (pointerIn ? pointer.x * 0.3 : 0);
    points.rotation.x += (0.35 - (pointerIn ? pointer.y * 0.2 : 0) - points.rotation.x) * Math.min(1, dt * 3);

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
  }).observe(host);
}
