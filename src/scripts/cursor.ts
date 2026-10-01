export function mountCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const el = (tag: string, className: string) => Object.assign(document.createElement(tag), { className });
  const dot = el('div', 'cursor-dot');
  const ring = el('div', 'cursor-ring');
  const hand = el('span', 'cursor-hand');
  const label = el('span', 'cursor-label');
  ring.append(el('span', 'cursor-crown'), hand, label);
  document.body.append(ring, dot);
  root.classList.add('has-cursor');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lag = still ? 1 : 0.2;
  let x = 0;
  let y = 0;
  let rx = 0;
  let ry = 0;
  let angle = 0;
  let hovering = false;
  let lapUntil = 0;

  addEventListener(
    'pointermove',
    (e) => {
      if (!root.classList.contains('cursor-on')) {
        rx = x = e.clientX;
        ry = y = e.clientY;
        root.classList.add('cursor-on');
      }
      angle += Math.hypot(e.clientX - x, e.clientY - y) * 1.5;
      x = e.clientX;
      y = e.clientY;
      hovering = !!(e.target as Element).closest('a, button');
      ring.classList.toggle('hover', hovering);
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => root.classList.remove('cursor-on'));
  addEventListener('pointerdown', () => {
    ring.classList.add('down');
    lapUntil = performance.now() + 600;
    if (!still) ring.animate([{ boxShadow: '0 0 0 0 rgba(255,255,255,0.9)' }, { boxShadow: '0 0 0 22px rgba(255,255,255,0)' }], 550);
  });
  addEventListener('pointerup', () => ring.classList.remove('down'));

  let last = performance.now();
  const loop = (now: number) => {
    if (!still) angle += (now - last) * 0.006;
    last = now;
    rx += (x - rx) * lag;
    ry += (y - ry) * lag;
    const lap = now < lapUntil;
    label.textContent = lap ? 'Lap' : 'Go';
    ring.classList.toggle('lap', lap);
    hand.style.transform = `translate(-50%, -100%) rotate(${Math.round(angle / 6) * 6}deg)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
