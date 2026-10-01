const STRIDE = 30;
const SPREAD = 8;
const PULL = 0.22;
const MAX_PULL = 10;
const BURST = 10;
const NS = 'http://www.w3.org/2000/svg';

function footprint(className: string) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 10 18');
  svg.setAttribute('class', className);
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
  const stance = Object.assign(document.createElement('div'), { className: 'cursor-stance' });
  stance.append(footprint('foot left'), footprint('foot right'));
  const steps = Array.from({ length: 16 }, () => footprint('cursor-step'));
  document.body.append(...steps, stance, dot);
  root.classList.add('has-cursor');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let next = 0;
  let side = 1;
  let target: HTMLElement | null = null;
  const pulled = new Map<HTMLElement, { x: number; y: number }>();

  const step = () => {
    const angle = Math.atan2(y - sy, x - sx);
    const foot = steps[next];
    next = (next + 1) % steps.length;
    foot.style.translate = `${x - Math.sin(angle) * SPREAD * side}px ${y + Math.cos(angle) * SPREAD * side}px`;
    foot.style.rotate = `${(angle * 180) / Math.PI + 90}deg`;
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
      dot.style.translate = `${x}px ${y}px`;
      stance.style.translate = `${x}px ${y + 22}px`;
      target = (e.target as Element).closest<HTMLElement>('a, button');
      root.classList.toggle('cursor-planted', !!target);
      if (target && !pulled.has(target)) pulled.set(target, { x: 0, y: 0 });
      if (target) {
        sx = x;
        sy = y;
      } else if (!still && Math.hypot(x - sx, y - sy) >= STRIDE) step();
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => {
    root.classList.remove('cursor-on', 'cursor-planted');
    target = null;
  });
  const burst = (bx: number, by: number) => {
    const ring = Object.assign(document.createElement('div'), { className: 'cursor-burst-ring' });
    ring.style.translate = `${bx}px ${by}px`;
    document.body.append(ring);
    ring.animate([{ scale: 0.2, opacity: 0.9 }, { scale: 1, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' }).onfinish = () => ring.remove();
    for (let i = 0; i < BURST; i++) {
      const angle = (i / BURST) * 360 + Math.random() * 14;
      const line = Object.assign(document.createElement('div'), { className: 'cursor-burst-line' });
      line.style.translate = `${bx}px ${by}px`;
      line.style.rotate = `${angle}deg`;
      document.body.append(line);
      line.animate(
        [
          { transform: 'translateX(10px) scaleX(1)', opacity: 1 },
          { transform: `translateX(${46 + Math.random() * 18}px) scaleX(0.2)`, opacity: 0 },
        ],
        { duration: 480, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' },
      ).onfinish = () => line.remove();
    }
  };
  addEventListener('pointerdown', (e) => {
    if (still) return;
    stance.animate([{ scale: 1 }, { scale: 0.8 }, { scale: 1 }], 260);
    burst(e.clientX, e.clientY);
  });

  const loop = () => {
    for (const [el, p] of pulled) {
      let tx = 0;
      let ty = 0;
      if (el === target && !still) {
        const r = el.getBoundingClientRect();
        tx = Math.max(-MAX_PULL, Math.min(MAX_PULL, (x - r.left - r.width / 2) * PULL));
        ty = Math.max(-MAX_PULL, Math.min(MAX_PULL, (y - r.top - r.height / 2) * PULL));
      }
      p.x += (tx - p.x) * 0.18;
      p.y += (ty - p.y) * 0.18;
      if (el !== target && Math.abs(p.x) < 0.1 && Math.abs(p.y) < 0.1) {
        el.style.translate = '';
        pulled.delete(el);
      } else {
        el.style.translate = `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
