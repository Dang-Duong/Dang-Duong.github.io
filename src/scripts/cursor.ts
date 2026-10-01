const STRIDE = 30;
const SPREAD = 8;
const NS = 'http://www.w3.org/2000/svg';

function footprint() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 10 18');
  svg.setAttribute('class', 'cursor-step');
  for (const [cx, cy, rx, ry] of [
    [5, 6, 4, 5.5],
    [5, 14.6, 3, 3],
  ]) {
    const e = document.createElementNS(NS, 'ellipse');
    e.setAttribute('cx', String(cx));
    e.setAttribute('cy', String(cy));
    e.setAttribute('rx', String(rx));
    e.setAttribute('ry', String(ry));
    svg.append(e);
  }
  return svg;
}

export function mountCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const dot = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  const steps = Array.from({ length: 16 }, footprint);
  document.body.append(...steps, ring, dot);
  root.classList.add('has-cursor');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let next = 0;
  let side = 1;

  const step = () => {
    const angle = Math.atan2(y - sy, x - sx);
    const foot = steps[next];
    next = (next + 1) % steps.length;
    const px = x - Math.sin(angle) * SPREAD * side;
    const py = y + Math.cos(angle) * SPREAD * side;
    foot.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${(angle * 180) / Math.PI + 90}deg)`;
    foot.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 900, easing: 'ease-in' });
    side *= -1;
    sx = x;
    sy = y;
  };

  addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!root.classList.contains('cursor-on')) {
        sx = x;
        sy = y;
        root.classList.add('cursor-on');
      }
      dot.style.transform = ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.classList.toggle('hover', !!(e.target as Element).closest('a, button'));
      if (!still && Math.hypot(x - sx, y - sy) >= STRIDE) step();
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => root.classList.remove('cursor-on'));
  addEventListener('pointerdown', () => {
    if (!still) ring.animate([{ boxShadow: '0 0 0 0 rgba(255,255,255,0.9)' }, { boxShadow: '0 0 0 18px rgba(255,255,255,0)' }], 450);
  });
}
