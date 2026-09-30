# CV Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sporty one-page Astro CV site with a WebGL Ironman-rings hero, a printable `/cv` page, a generated `cv.pdf`, deployed to GitHub Pages.

**Architecture:** One typed data file (`src/data/cv.ts`) renders both `/` and `/cv`. The hero is a vanilla Three.js module mounted client-side. `scripts/cv-pdf.mjs` prints `/cv` to `public/cv.pdf` with Playwright. GitHub Actions builds and deploys.

**Tech Stack:** Astro 7, TypeScript, Three.js 0.186, Playwright 1.63 (dev), pnpm, Node 22.

**Spec:** `docs/superpowers/specs/2026-09-30-cv-landing-design.md`

## Global Constraints
- Never mention FTMO anywhere in repo content.
- No unverified claims: no Android release, no user counts.
- Contact email: `duongd973@gmail.com`.
- Dark only; accent volt `#D4FF3A`; fonts Barlow Condensed (display), Inter (body), JetBrains Mono (labels).
- Astro `base: '/cv'`, `site: 'https://dang-duong.github.io'` (switch to custom domain later: set `site`, drop `base`, add `public/CNAME`).
- Works at 390px width with no horizontal scroll.
- No code comments unless necessary.

## Review Focus
1. WebGL unavailable → page still renders, hero area shows no broken canvas (try/catch around renderer; hide canvas).
2. `prefers-reduced-motion: reduce` → rings render one static frame, no animation loop.
3. Asset/links under `/cv` base path → all internal links use `import.meta.env.BASE_URL`; verified by clicking Download CV on preview.
4. 390px mobile → no horizontal overflow (checked via `document.documentElement.scrollWidth <= innerWidth` in Playwright).
5. Content invariants (no FTMO/Android, correct email) → `tests/cv.test.ts`.

---

### Task 1: Scaffold + CV data + invariant test

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/data/cv.ts`, `tests/cv.test.ts`

**Interfaces:**
- Produces: `export const cv: CV` from `src/data/cv.ts` with shape `{ name, title, location, tagline, intro, email, phone, links: {label,href}[], experience: {company, role, type, period, bullets: string[]}[], skills: {group, items: string[]}[], education: {school, degree, period, note?}[], projectsNote, interests, languages: string[] }`.

- [ ] **Step 1: package.json / config**

```json
{
  "name": "cv",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test --experimental-strip-types tests/",
    "cv:pdf": "astro build && node scripts/cv-pdf.mjs"
  }
}
```
Then `pnpm add astro three && pnpm add -D @types/three playwright`.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://dang-duong.github.io', base: '/cv' });
```
`tsconfig.json`: `{ "extends": "astro/tsconfigs/strict" }`. `.gitignore`: `node_modules dist .astro`.

- [ ] **Step 2: Write failing test** `tests/cv.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cv } from '../src/data/cv.ts';

const text = JSON.stringify(cv).toLowerCase();

test('never names target employer or unverified claims', () => {
  for (const banned of ['ftmo', 'android', 'play store']) assert.ok(!text.includes(banned), banned);
});
test('contact email', () => assert.equal(cv.email, 'duongd973@gmail.com'));
test('two experience entries with bullets', () => {
  assert.equal(cv.experience.length, 2);
  for (const e of cv.experience) assert.ok(e.bullets.length >= 4, e.company);
});
test('ironman in interests', () => assert.match(cv.interests, /ironman/i));
```
Run `pnpm test` → FAIL (module not found).

- [ ] **Step 3: `src/data/cv.ts`** — full content:

```ts
export const cv = {
  name: 'Nguyen Dang Duong',
  title: 'Software Engineer',
  location: 'Prague, CZ',
  tagline: 'Built for the long distance.',
  intro: 'Software engineer shipping AI-powered web & mobile products end-to-end. Finishing my BSc in Software Development in 2026. Currently training for my first Ironman.',
  email: 'duongd973@gmail.com',
  phone: '+420 720 072 937',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dang-duong-nguyen/' },
    { label: 'GitHub', href: 'https://github.com/Dang-Duong' },
  ],
  experience: [
    {
      company: 'Yolk Studio',
      role: 'Software Engineer',
      type: 'Full-time',
      period: 'Aug 2025 – Present',
      bullets: [
        'Took an AI document-extraction product to production with Gemini — smart input extraction, evidence checklists and an admin console for prompts, benchmarks, test sets and correction replay',
        'Built secure MCP API access for AI agents on a lending platform — SHA-256-hashed keys, tenant-scoped row-level security and per-key rate limiting; closed two security-audit findings',
        'Automated studio operations: n8n leave sync, a Slack bot, Chrome Web Store release CI and an automated React code-health scan on every PR across 3 repos',
        'Core engineer on the rebuild of a UK mortgage-origination platform — 396 merged PRs in 3 months across underwriting decisions, lending-policy engine and funds release (React, TanStack Query, Express, Drizzle/Postgres, .NET)',
        'Grew the platform test suite to ~1,200 tests, added CI gates for schema drift, dead code and formatting, and profiled large tables with the Event Timing API to keep interactions fast at 2,000 rows',
        'Shipped fintech features in React Native for an investment app — QR wallet deposits, AML verification flows and biometric sessions',
        '1,100+ merged PRs across 10+ client products — web, mobile and backend',
      ],
    },
    {
      company: 'Hostivio & Pultio',
      role: 'Founding Engineer',
      type: 'Part-time',
      period: 'Jan 2025 – Present',
      bullets: [
        'Built AI guest-ID scanning — a vision LLM reads passports and ID cards into strict JSON schemas via zero-data-retention routing, images never stored; preceded by an on-device OCR version with MRZ check-digit validation in a Web Worker',
        'Shipped the Hostivio iOS app (Expo / React Native) with EAS builds, OTA updates, push notifications and GitHub Actions CI',
        'Automated Czech police foreign-guest registration (Ubyport) with batch submission, removing a manual legal chore for hosts',
        'Built Stripe Connect payments — host onboarding, balances, payouts — and a direct booking engine with an embeddable widget',
        'Cut homepage mobile LCP from 10.7 s by shrinking hero media from 1.35 MB to ~50 KB; standardised PostHog analytics, session replay and error tracking across apps',
        'Built the Pultio point-of-sale back office — inventory, catalogue, statistics and EAN barcode restocking',
      ],
    },
  ],
  skills: [
    { group: 'AI & Automation', items: ['LLM integration (Gemini, OpenRouter vision)', 'MCP', 'Claude Code', 'n8n', 'GitHub Actions'] },
    { group: 'Frontend', items: ['TypeScript', 'React', 'Next.js (App Router, SSR)', 'Vite', 'TanStack Query', 'Tailwind', 'shadcn/ui', 'GSAP'] },
    { group: 'Mobile', items: ['React Native', 'Expo', 'EAS', 'Reanimated', 'Tamagui'] },
    { group: 'Backend', items: ['Node / Express', 'NestJS', '.NET / C#', 'PostgreSQL / Drizzle', 'Stripe'] },
    { group: 'Quality', items: ['Playwright', 'Vitest / Jest', 'PostHog', 'Sentry'] },
  ],
  education: [
    { school: 'Unicorn University, Prague', degree: 'BSc Software Development', period: '2024 – 2026 (graduating)' },
    { school: 'VŠE, Prague', degree: 'Faculty of Informatics and Statistics', period: '2023 – 2024' },
    { school: 'Gymnázium Ostrov', degree: '8-year programme, Maturita', period: '2015 – 2023' },
  ],
  projectsNote: "Curious what I've built? Let me know and I'll happily walk you through it.",
  interests: 'Really into sport — recently started training for my first Ironman. Football & basketball on the side.',
  languages: ['Czech (native)', 'English (fluent)', 'Vietnamese (intermediate)'],
};

export type CV = typeof cv;
```

- [ ] **Step 4:** `pnpm test` → PASS (4 tests).
- [ ] **Step 5: Commit** `feat: scaffold astro and cv data`

---

### Task 2: Layout, styles, landing page (no 3D yet)

**Files:**
- Create: `src/layouts/Base.astro`, `src/styles/global.css`, `src/pages/index.astro`

**Interfaces:**
- Consumes: `cv` from Task 1.
- Produces: `<div id="hero-canvas">` mount point in `index.astro` (Task 3 fills it); `Base` layout with props `{ title: string; description: string }`.

- [ ] **Step 1: `Base.astro`** — `<html lang="en">`, meta viewport/description, Google Fonts link for `Barlow+Condensed:wght@600;800`, `Inter:wght@400;500;600`, `JetBrains+Mono:wght@400;500`, imports `global.css`, `<slot />`.

- [ ] **Step 2: `global.css`** — tokens on `:root`:
```css
:root{--bg:#0b0c0e;--fg:#f2f2ee;--muted:#8b8d93;--line:#23252a;--accent:#d4ff3a;
--display:'Barlow Condensed',sans-serif;--body:'Inter',sans-serif;--mono:'JetBrains Mono',monospace}
*{box-sizing:border-box;margin:0}
html{background:var(--bg);color:var(--fg);font:16px/1.6 var(--body)}
body{overflow-x:hidden}
.wrap{max-width:1100px;margin:0 auto;padding:0 16px}
h1,h2,h3{font-family:var(--display);text-transform:uppercase;letter-spacing:.01em;line-height:.95}
.label{font:500 12px var(--mono);color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.split{display:flex;gap:12px;align-items:baseline;border-top:1px solid var(--line);padding-top:16px}
.split b{color:var(--accent);font-family:var(--mono)}
a{color:inherit}
```
Plus section/grid rules: experience rows 2-col on ≥768px (meta left, bullets right), 1-col below; skills as pill chips with `border:1px solid var(--line)`; `@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`.

- [ ] **Step 3: `index.astro`** sections in order:
  1. Top bar: name · title, location · race-timer clock `<span class="label" id="clock">` · `<a href="#contact">Contact</a>`.
  2. Hero: `<h1>` tagline (huge, clamp(64px,12vw,180px)), intro paragraph, `<div id="hero-canvas">` absolutely positioned right/behind.
  3. `01 / Experience` — map `cv.experience`.
  4. `02 / Skills` — map groups to chips.
  5. `03 / Education`, then projectsNote line.
  6. `04 / Off the clock` — interests + languages.
  7. Footer `#contact`: "Get in <em>contact</em>", mailto, links, `<a href={import.meta.env.BASE_URL + 'cv.pdf'} download>Download CV</a>`, `© {new Date().getFullYear()}`.
  Clock script:
```html
<script>
  const el = document.getElementById('clock')!;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tick = () => (el.textContent = `Prague ${fmt.format(new Date())}`);
  tick(); setInterval(tick, 1000);
</script>
```

- [ ] **Step 4:** `pnpm build` → success. `pnpm preview`, Playwright screenshot 1440px and 390px; assert `scrollWidth <= innerWidth` at 390.
- [ ] **Step 5: Commit** `feat: landing page layout and sporty styles`

---

### Task 3: WebGL Ironman rings hero

**Files:**
- Create: `src/scripts/rings.ts`
- Modify: `src/pages/index.astro` (add `<script>import { mountRings } from '../scripts/rings'; mountRings(document.getElementById('hero-canvas')!);</script>`)

**Interfaces:**
- Produces: `export function mountRings(host: HTMLElement): void`

- [ ] **Step 1: `rings.ts`**

```ts
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
  [
    { color: '#d4ff3a', pos: [-1.05, 0.35, 0], rot: [0.3, 0.5, 0] },
    { color: '#e8e8e8', pos: [0.95, 0.35, 0], rot: [-0.3, -0.5, 0.2] },
    { color: '#9aa0a8', pos: [0, -0.75, 0], rot: [1.2, 0.1, 0] },
  ].forEach(({ color, pos, rot }) => {
    const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color, ...chrome }));
    m.position.set(...(pos as [number, number, number]));
    m.rotation.set(...(rot as [number, number, number]));
    group.add(m);
  });
  scene.add(group);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vel = { x: 0, y: 0.004 };
  let drag: { x: number; y: number } | null = null;
  host.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    vel.y = (e.clientX - drag.x) * 0.0008;
    vel.x = (e.clientY - drag.y) * 0.0008;
    drag = { x: e.clientX, y: e.clientY };
  });
  host.addEventListener('pointerup', () => (drag = null));

  const frame = () => {
    group.rotation.y += vel.y;
    group.rotation.x += vel.x;
    if (!drag) { vel.x *= 0.95; vel.y += (0.004 - vel.y) * 0.02; }
    group.position.y = -scrollY * 0.002;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  reduced ? renderer.render(scene, camera) : frame();
}
```
Host CSS: `#hero-canvas{position:absolute;inset:0 0 0 35%;cursor:grab;touch-action:pan-y}` + `canvas{width:100%;height:100%}`; on <768px: `inset:auto 0 0 0;height:60vw;position:relative`. Add a small `.label` "Drag" hint.

- [ ] **Step 2:** `pnpm build`; Playwright screenshot shows rings; drag with mouse changes rotation (compare two screenshots); emulate `reducedMotion: 'reduce'` → no console errors.
- [ ] **Step 3: Commit** `feat: webgl ironman rings hero`

---

### Task 4: Printable `/cv` page + PDF

**Files:**
- Create: `src/pages/cv.astro`, `scripts/cv-pdf.mjs`, `public/cv.pdf` (generated)

**Interfaces:**
- Consumes: `cv`.

- [ ] **Step 1: `cv.astro`** — standalone white A4 page (not dark): name in Barlow Condensed with a thin volt underline bar, contact line (phone · email · github · linkedin), then Experience, Skills (group: items joined by ` · `), Education, Projects note, Interests, Languages. `@page{size:A4;margin:14mm}`, body 10pt Inter.

- [ ] **Step 2: `scripts/cv-pdf.mjs`**

```js
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server = spawn('pnpm', ['preview', '--port', '4399'], { stdio: 'ignore' });
try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let i = 0; ; i++) {
    try { await page.goto('http://localhost:4399/cv/cv/', { waitUntil: 'networkidle' }); break; }
    catch (e) { if (i > 40) throw e; await new Promise((r) => setTimeout(r, 250)); }
  }
  await page.pdf({ path: 'public/cv.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
} finally {
  server.kill();
}
```
- [ ] **Step 3:** `pnpm exec playwright install chromium && pnpm cv:pdf && pnpm build`; `pdfinfo public/cv.pdf` → Pages ≤ 2; `pdftotext` contains "Yolk Studio" and not "FTMO".
- [ ] **Step 4: Commit** `feat: printable cv page and generated pdf`

---

### Task 5: GitHub repo + Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md` (3 lines: what, `pnpm dev`, `pnpm cv:pdf`)

- [ ] **Step 1: workflow**

```yaml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v4
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```
- [ ] **Step 2:** `gh repo create Dang-Duong/cv --public --source . --remote origin`; push branch as `main`; `gh api -X POST repos/Dang-Duong/cv/pages -f build_type=workflow`.
- [ ] **Step 3:** Watch run to success; `curl -sI https://dang-duong.github.io/cv/` → 200; `.../cv/cv.pdf` → 200.
- [ ] **Step 4: Commit** `ci: github pages deploy`
