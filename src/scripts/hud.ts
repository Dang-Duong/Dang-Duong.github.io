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

export function mountHeartRate(canvas: HTMLCanvasElement, bpmEl: HTMLElement) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 2);
  let bpm = 142;
  const draw = (now: number) => {
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = canvas.clientHeight * dpr);
    ctx.strokeStyle = '#d4ff3a';
    ctx.lineWidth = 1.5 * dpr;
    ctx.shadowColor = '#d4ff3a';
    ctx.shadowBlur = 6 * dpr;
    ctx.beginPath();
    const beat = 60000 / bpm;
    const span = beat * 2.5;
    for (let x = 0; x <= w; x += dpr) {
      const t = now - span + (x / w) * span;
      const y = h * 0.72 - ecg((t / beat) % 1) * h * 0.6;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(0);
    return;
  }
  setInterval(() => {
    bpm = 138 + Math.round(Math.random() * 9);
    bpmEl.textContent = String(bpm);
  }, 1500);
  const loop = (now: number) => {
    draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
