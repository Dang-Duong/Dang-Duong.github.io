import { chromium } from 'playwright';

const html = String.raw`<!doctype html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #f3f1ec; color: #111; position: relative; overflow: hidden; }
  h1 { position: absolute; left: 72px; bottom: 96px; font: 800 168px/0.86 'Barlow Condensed'; text-transform: uppercase; }
  h1 span { color: #2446ff; }
  p { position: absolute; left: 76px; top: 64px; font: 500 20px 'JetBrains Mono'; letter-spacing: 0.12em; text-transform: uppercase; }
  p i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #2446ff; margin-right: 12px; vertical-align: 1px; }
  canvas { position: absolute; right: 40px; top: 70px; }
</style>
</head>
<body>
  <p><i></i>Software engineer · Prague</p>
  <h1>Nguyen Dang<br><span>Duong</span></h1>
  <canvas id="c" width="520" height="480"></canvas>
  <script>
    const S = 400;
    const off = document.createElement('canvas');
    off.width = off.height = S;
    const g = off.getContext('2d');
    g.strokeStyle = g.fillStyle = '#fff';
    g.lineCap = g.lineJoin = 'round';
    const line = (w, ...p) => { g.lineWidth = w; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
    const dot = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    g.lineWidth = 14;
    for (const x of [100, 300]) { g.beginPath(); g.arc(x, 285, 64, 0, Math.PI * 2); g.stroke(); }
    line(12, 100, 285, 172, 205, 205, 285, 100, 285);
    line(12, 172, 205, 268, 200, 300, 285);
    line(12, 205, 285, 268, 200);
    line(12, 262, 200, 272, 170, 292, 172);
    dot(262, 108, 24);
    line(22, 176, 188, 246, 134);
    line(18, 240, 142, 280, 176);
    line(20, 176, 190, 238, 222, 208, 282);
    line(18, 176, 190, 212, 250, 184, 292);
    const data = g.getImageData(0, 0, S, S).data;
    const pts = [];
    for (let i = 0; i < S * S; i++) if (data[i * 4 + 3] > 128) pts.push([i % S, (i / S) | 0]);
    const c = document.getElementById('c').getContext('2d');
    const k = 1.25;
    for (let i = 0; i < 16000; i++) {
      const [x, y] = pts[(Math.random() * pts.length) | 0];
      const s = Math.random();
      c.globalAlpha = 0.55 + 0.45 * s;
      c.fillStyle = '#111';
      c.beginPath();
      c.arc(10 + (x + Math.random()) * k, (y + Math.random() - 30) * k, 0.8 + s * 1.4, 0, Math.PI * 2);
      c.fill();
    }
    document.body.dataset.ready = '1';
  </script>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector('body[data-ready]');
await page.screenshot({ path: 'public/og.png' });
await browser.close();
