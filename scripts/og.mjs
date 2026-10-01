import { chromium } from 'playwright';

const html = String.raw`<!doctype html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; }
  body { width: 1200px; height: 630px; background: #f3f1ec; display: grid; place-items: center; }
  h1 { font: 800 200px/0.86 'Barlow Condensed'; text-transform: uppercase; color: #111; text-align: center; }
  span { color: #2446ff; }
  main { text-align: center; }
  p { font: 500 24px 'JetBrains Mono'; letter-spacing: 0.16em; text-transform: uppercase; color: #111; margin-bottom: 34px; }
  p i { display: inline-block; width: 11px; height: 11px; border-radius: 50%; background: #2446ff; margin-right: 14px; vertical-align: 2px; }
</style>
</head>
<body><main><p><i></i>Software engineer</p><h1>Nguyen Dang<br><span>Duong</span></h1></main></body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
