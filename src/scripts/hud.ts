const RACE_START = new Date('2025-01-06T09:00:00+01:00').getTime();

const pad = (n: number) => String(n).padStart(2, '0');

export function mountRaceTime(el: HTMLElement) {
  const tick = () => {
    const s = Math.floor((Date.now() - RACE_START) / 1000);
    const days = Math.floor(s / 86400);
    el.textContent = `${days}d ${pad(Math.floor(s / 3600) % 24)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  tick();
  setInterval(tick, 1000);
}

function ecg(phase: number) {
  const bump = (center: number, width: number, height: number) =>
    height * Math.exp(-(((phase - center) / width) ** 2));
  return bump(0.18, 0.035, 0.12) - bump(0.36, 0.012, 0.18) + bump(0.4, 0.014, 1) - bump(0.44, 0.014, 0.3) + bump(0.66, 0.06, 0.22);
}

export function mountHeartRate(canvas: HTMLCanvasElement, getBpm: () => number) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 2);
  const STEP = 1.5;
  const samples: number[] = [];
  let phase = 0;
  let last = 0;
  const draw = () => {
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = canvas.clientHeight * dpr);
    const max = Math.ceil(canvas.clientWidth / STEP) + 1;
    while (samples.length > max) samples.shift();
    ctx.strokeStyle = '#d4ff3a';
    ctx.lineWidth = 1.5 * dpr;
    ctx.shadowColor = '#d4ff3a';
    ctx.shadowBlur = 6 * dpr;
    ctx.beginPath();
    samples.forEach((v, i) => {
      const x = w - (samples.length - 1 - i) * STEP * dpr;
      const y = h * 0.72 - v * h * 0.6;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  };
  const push = (dt: number) => {
    const beat = 60000 / Math.max(40, getBpm());
    for (let i = 0; i < 2; i++) {
      phase = (phase + dt / 2 / beat) % 1;
      samples.push(ecg(phase));
    }
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let i = 0; i < 400; i++) push(16);
    draw();
    return;
  }
  const loop = (now: number) => {
    push(last ? Math.min(now - last, 50) : 16);
    last = now;
    draw();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
