export function mountCursor(morphZone: HTMLElement) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  ring.append(Object.assign(document.createElement('span'), { textContent: 'Morph' }));
  document.body.append(ring, dot);
  root.classList.add('has-cursor');

  const lag = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.2;
  let x = 0;
  let y = 0;
  let rx = 0;
  let ry = 0;
  addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!root.classList.contains('cursor-on')) {
        rx = x;
        ry = y;
        root.classList.add('cursor-on');
      }
      const target = e.target as Element;
      const interactive = !!target.closest('a, button');
      ring.classList.toggle('hover', interactive);
      ring.classList.toggle('morph', !interactive && morphZone.contains(target));
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => root.classList.remove('cursor-on'));
  addEventListener('pointerdown', () => ring.classList.add('down'));
  addEventListener('pointerup', () => ring.classList.remove('down'));

  const loop = () => {
    rx += (x - rx) * lag;
    ry += (y - ry) * lag;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
