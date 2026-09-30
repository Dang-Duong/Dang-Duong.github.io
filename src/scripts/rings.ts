import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function mountRings(host: HTMLElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    host.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const geo = new THREE.TorusGeometry(1.2, 0.16, 64, 220);
  const chrome = { metalness: 1, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1 };
  const group = new THREE.Group();
  const rings: { color: string; pos: [number, number, number]; rot: [number, number, number] }[] = [
    { color: '#d4ff3a', pos: [-1.05, 0.35, 0], rot: [0.3, 0.5, 0] },
    { color: '#e8e8e8', pos: [0.95, 0.35, 0], rot: [-0.3, -0.5, 0.2] },
    { color: '#9aa0a8', pos: [0, -0.75, 0], rot: [1.2, 0.1, 0] },
  ];
  for (const { color, pos, rot } of rings) {
    const mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color, ...chrome }));
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    group.add(mesh);
  }
  scene.add(group);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const vel = { x: 0, y: 0.004 };
  let drag: { x: number; y: number } | null = null;
  host.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    vel.y = (e.clientX - drag.x) * 0.0008;
    vel.x = (e.clientY - drag.y) * 0.0008;
    drag = { x: e.clientX, y: e.clientY };
  });
  const release = () => (drag = null);
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);

  const frame = () => {
    group.rotation.y += vel.y;
    group.rotation.x += vel.x;
    if (!drag) {
      vel.x *= 0.95;
      vel.y += (0.004 - vel.y) * 0.02;
    }
    group.position.y = -scrollY * 0.002;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  frame();
}
