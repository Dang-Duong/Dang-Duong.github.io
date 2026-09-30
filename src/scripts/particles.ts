import * as THREE from 'three';

const HOLD_MS = 4200;

function text(label: string, n: number, width = 3.8) {
  const W = 640;
  const H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = 260;
  ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
  size *= Math.min(1, (W * 0.9) / ctx.measureText(label).width);
  ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
  ctx.fillText(label, W / 2, H / 2 + size * 0.04);
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

function wheel(n: number) {
  const out = new Float32Array(n * 3);
  const R = 1.45;
  const spokes = 18;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    const a = Math.random() * Math.PI * 2;
    let x: number;
    let y: number;
    let z = (Math.random() - 0.5) * 0.04;
    if (r < 0.55) {
      const t = Math.random() * Math.PI * 2;
      const rr = R + Math.cos(t) * 0.07;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
      z = Math.sin(t) * 0.07;
    } else if (r < 0.92) {
      const s = (Math.floor(Math.random() * spokes) / spokes) * Math.PI * 2;
      const d = 0.12 + Math.random() * (R - 0.15);
      x = Math.cos(s) * d;
      y = Math.sin(s) * d;
      z = (1 - d / R) * 0.18 * (Math.random() < 0.5 ? 1 : -1);
    } else {
      const d = Math.sqrt(Math.random()) * 0.14;
      x = Math.cos(a) * d;
      y = Math.sin(a) * d;
      z = (Math.random() - 0.5) * 0.3;
    }
    out.set([x, y, z], i * 3);
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
  uniform float uSize;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uForce;
  uniform vec3 uInk;
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

    vColor = uInk;
    vAlpha = (0.7 + 0.3 * seed) * smoothstep(-12.0, -4.0, mv.z);
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

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => t * t * (3 - 2 * t);

export async function mountParticles(host: HTMLElement, hero: HTMLElement, panel: HTMLElement) {
  await document.fonts.load('800 100px "Barlow Condensed"').catch(() => {});
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
  camera.position.z = 6;

  const n = matchMedia('(max-width: 900px)').matches ? 14000 : 30000;
  const shapes = [text('NDD', n, 4.2), wheel(n), text('</>', n, 3.9), text('140.6', n, 4.6)];
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
    uInk: { value: new THREE.Color('#ffffff') },
  };

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

  const pointer = new THREE.Vector2();
  let pointerIn = false;
  let pointerSpeed = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  addEventListener(
    'pointermove',
    (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -(e.clientY / innerHeight) * 2 + 1;
      pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(x - pointer.x, y - pointer.y) * 4);
      pointer.set(x, y);
      pointerIn = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => (pointerIn = false));

  let target = 0;
  let nextAt = performance.now() + HOLD_MS;
  const advance = () => {
    target += 1;
    nextAt = performance.now() + HOLD_MS;
  };
  hero.addEventListener('click', advance);

  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  let spin = 0;
  let last = performance.now();
  const frame = (now: number) => {
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

    const p = ease(clamp01(1 - panel.getBoundingClientRect().top / innerHeight));
    const fit = Math.min(1, (view.halfW * 2 * 0.86) / 4.6);
    if (view.wide) {
      from.set(0, view.halfH * 0.28, 0);
      to.set(view.halfW * 0.5, -view.halfH * 0.05, 0);
    } else {
      from.set(0, view.halfH * 0.32, 0);
      to.set(view.halfW * 0.35, view.halfH * 0.62, 0);
    }
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
